"""
PlantTwin AI Backend — Core Scheduler Engine
============================================
Background task scheduling engine for automated reporting, maintenance triggers, and sensor health sweeps.
"""
import asyncio
from datetime import datetime
from typing import Callable, Dict, Any
from app.core.logging.logger import logger


class TaskScheduler:
    """Async background task scheduler using asyncio loops."""

    def __init__(self):
        self._tasks: Dict[str, asyncio.Task] = {}
        self._is_running = False

    async def start(self):
        """Start the background scheduler."""
        self._is_running = True
        logger.info("Core Task Scheduler initialized and running.")

    async def stop(self):
        """Stop all background scheduled tasks."""
        self._is_running = False
        for name, task in self._tasks.items():
            task.cancel()
            logger.info(f"Cancelled background task: {name}")
        self._tasks.clear()

    def schedule_interval(self, name: str, interval_seconds: int, func: Callable, *args, **kwargs):
        """Schedule a recurring background task."""
        async def _wrapper():
            while self._is_running:
                try:
                    await asyncio.sleep(interval_seconds)
                    if asyncio.iscoroutinefunction(func):
                        await func(*args, **kwargs)
                    else:
                        func(*args, **kwargs)
                except asyncio.CancelledError:
                    break
                except Exception as exc:
                    logger.error(f"Error executing scheduled task {name}: {str(exc)}")

        task = asyncio.create_task(_wrapper())
        self._tasks[name] = task
        logger.info(f"Scheduled task '{name}' every {interval_seconds} seconds.")


scheduler = TaskScheduler()
