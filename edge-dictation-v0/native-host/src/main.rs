use serde::{Deserialize, Serialize};
use std::env;
use std::io::{self, Read, Write};

const MAX_MESSAGE_BYTES: usize = 1024 * 1024;

#[derive(Debug, Deserialize)]
struct Request {
    id: String,
    action: String,
}

#[derive(Debug, Serialize)]
struct Response<'a> {
    id: &'a str,
    kind: &'a str,
    state: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<&'a str>,
}

struct DemoEngine {
    active: bool,
    transcript: String,
}

impl DemoEngine {
    fn new() -> Self {
        Self {
            active: false,
            transcript: env::var("EDGE_DICTATION_DEMO_TRANSCRIPT")
                .unwrap_or_else(|_| "Demo transcript ready for clinician review.".to_owned()),
        }
    }

    fn handle<'a>(&mut self, request: &'a Request) -> Response<'a> {
        match request.action.as_str() {
            "start" if !self.active => {
                self.active = true;
                Response {
                    id: &request.id,
                    kind: "status",
                    state: "listening",
                    text: None,
                    message: Some("Demo engine listening"),
                }
            }
            "start" => Response {
                id: &request.id,
                kind: "status",
                state: "listening",
                text: None,
                message: Some("Session already active"),
            },
            "stop" if self.active => {
                self.active = false;
                Response {
                    id: &request.id,
                    kind: "final",
                    state: "idle",
                    text: Some(self.transcript.clone()),
                    message: Some("Demo final transcript"),
                }
            }
            "stop" => Response {
                id: &request.id,
                kind: "error",
                state: "idle",
                text: None,
                message: Some("No active session"),
            },
            _ => Response {
                id: &request.id,
                kind: "error",
                state: if self.active { "listening" } else { "idle" },
                text: None,
                message: Some("Unsupported action"),
            },
        }
    }
}

fn read_message(input: &mut impl Read) -> io::Result<Option<Vec<u8>>> {
    let mut length_bytes = [0_u8; 4];
    match input.read_exact(&mut length_bytes) {
        Ok(()) => {}
        Err(error) if error.kind() == io::ErrorKind::UnexpectedEof => return Ok(None),
        Err(error) => return Err(error),
    }
    let length = u32::from_ne_bytes(length_bytes) as usize;
    if length > MAX_MESSAGE_BYTES {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "message exceeds 1 MiB limit",
        ));
    }
    let mut body = vec![0_u8; length];
    input.read_exact(&mut body)?;
    Ok(Some(body))
}

fn write_message(output: &mut impl Write, response: &Response<'_>) -> io::Result<()> {
    let body = serde_json::to_vec(response)
        .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))?;
    let length = u32::try_from(body.len())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "response too large"))?;
    output.write_all(&length.to_ne_bytes())?;
    output.write_all(&body)?;
    output.flush()
}

fn main() {
    let mut input = io::stdin().lock();
    let mut output = io::stdout().lock();
    let mut engine = DemoEngine::new();

    loop {
        let bytes = match read_message(&mut input) {
            Ok(Some(bytes)) => bytes,
            Ok(None) => break,
            Err(error) => {
                eprintln!("native message read error: {error}");
                break;
            }
        };
        let request: Request = match serde_json::from_slice(&bytes) {
            Ok(request) => request,
            Err(error) => {
                eprintln!("invalid request: {error}");
                continue;
            }
        };
        let response = engine.handle(&request);
        if let Err(error) = write_message(&mut output, &response) {
            eprintln!("native message write error: {error}");
            break;
        }
    }
}
