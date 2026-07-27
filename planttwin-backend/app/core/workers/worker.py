"""
PlantTwin AI Backend — Core Async Worker Pool
==============================================
Background worker queue processor for asynchronous tasks (emails, report PDFs, ML inference).
"""
import asyncio
from typing import Any, Dict
from app.core.logging.logger import logger


class WorkerPool:
    """Async background worker queue processor."""

    def __init__(self, num_workers: int = 4):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.num_workers = num_workers
        self.workers = []
        self._running = False

    async def start(self):
        """Start worker consumer tasks."""
        self._running = True
        for i in range(self.num_workers):
            task = asyncio.create_task(self._worker_loop(i))
            self.workers.append(task)
        logger.info(f"WorkerPool started with {self.num_workers} workers.")

    async def enqueue(self, task_name: str, payload: Dict[str, Any]):
        """Enqueue a job into the background queue."""
        await self.queue.put({"name": task_name, "payload": payload})
        logger.info(f"Enqueued job '{task_name}' into worker queue.")

    async def _worker_loop(self, worker_id: int):
        while self._running:
            try:
                job = await self.queue.get()
                logger.info(f"Worker-{worker_id} processing job '{job['name']}'")
                await asyncio.sleep(0.1)  # Simulate processing
                self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error(f"Worker-{worker_id} error: {str(exc)}")

    async def stop(self):
        self._running = False
        for worker in self.workers:
            worker.cancel()


worker_pool = WorkerPool()
