from rag.presets import get_chunking_preset
from ingestion.semantic_chunker import split_markdown_semantically, split_text_semantically


class FakeEmbedder:
    def embed_documents(self, texts):
        return [[float(len(text)), float(text.count("多年后"))] for text in texts]


def test_continuous_chinese_text_splits_at_length_and_keeps_neighbors():
    text = "童年经历。" * 40 + "多年后加入组织。" + "任务经历。" * 40
    chunks = split_text_semantically(text, get_chunking_preset("character"), FakeEmbedder(), {"document_id": "d1"})
    assert len(chunks) >= 2
    assert all(chunk.char_count <= 1100 for chunk in chunks)
    assert chunks[0].next_chunk_id == chunks[1].chunk_id
    assert chunks[1].previous_chunk_id == chunks[0].chunk_id


def test_markdown_heading_path_is_preserved():
    text = "# 人物\n## 经历\n" + "内容。" * 100
    chunks = split_markdown_semantically(text, get_chunking_preset("knowledge_base"), FakeEmbedder(), {"document_id": "d1"})
    assert chunks
    assert any("人物" in chunk.heading_path and "经历" in chunk.heading_path for chunk in chunks)
