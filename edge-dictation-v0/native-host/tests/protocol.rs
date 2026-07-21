use std::io::Cursor;

#[test]
fn native_protocol_is_little_or_big_endian_native_length() {
    let body = br#"{\"id\":\"a\",\"action\":\"start\"}"#;
    let mut framed = Vec::new();
    framed.extend_from_slice(&(body.len() as u32).to_ne_bytes());
    framed.extend_from_slice(body);
    let mut cursor = Cursor::new(framed);
    let mut length_bytes = [0_u8; 4];
    use std::io::Read;
    cursor.read_exact(&mut length_bytes).unwrap();
    let mut decoded = vec![0_u8; u32::from_ne_bytes(length_bytes) as usize];
    cursor.read_exact(&mut decoded).unwrap();
    assert_eq!(decoded, body);
}
