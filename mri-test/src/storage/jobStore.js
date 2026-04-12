import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";

const jobs = new Map();
const events = new EventEmitter();

events.setMaxListeners(0);

export function createJob(input) {
  const now = new Date().toISOString();
  const job = {
    id: randomUUID(),
    status: "queued",
    input,
    result: null,
    error: null,
    events: [],
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(job.id, job);
  appendJobEvent(job.id, {
    type: "queued",
    message: "Report job queued.",
  });

  return job;
}

export function getJob(jobId) {
  return jobs.get(jobId) || null;
}

export function updateJob(jobId, patch) {
  const job = getJob(jobId);
  if (!job) return null;

  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  return job;
}

export function appendJobEvent(jobId, payload) {
  const job = getJob(jobId);
  if (!job) return null;

  const event = {
    id: job.events.length + 1,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  job.events.push(event);
  events.emit(jobId, event);
  return event;
}

export function subscribeToJob(jobId, listener) {
  events.on(jobId, listener);
  return () => events.off(jobId, listener);
}

