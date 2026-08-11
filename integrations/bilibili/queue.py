import asyncio


class LiveEventQueue:
    def __init__(self, maxsize: int = 200) -> None:
        self._queue = asyncio.Queue(maxsize=maxsize)

    async def put(self, item) -> None:
        if self._queue.full():
            self._queue.get_nowait()
            self._queue.task_done()
        await self._queue.put(item)

    async def get(self):
        return await self._queue.get()

    def task_done(self) -> None:
        self._queue.task_done()

    def qsize(self) -> int:
        return self._queue.qsize()

    def clear(self) -> None:
        while not self._queue.empty():
            self._queue.get_nowait()
            self._queue.task_done()
