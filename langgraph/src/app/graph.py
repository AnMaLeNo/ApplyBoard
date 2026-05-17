from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.llm import JsonLLMClient
from app.nodes.analyze_offer import make_analyze_offer_node
from app.nodes.select_title import make_select_title_node


class CvGenerationState(TypedDict, total=False):
    offer: dict[str, Any]
    offer_analysis: dict[str, Any]
    title_variants: list[str]
    title_selection: dict[str, Any]


def build_graph(llm: JsonLLMClient):
    graph_builder = StateGraph(CvGenerationState)

    graph_builder.add_node("analyze_offer", make_analyze_offer_node(llm))
    graph_builder.add_node("select_title", make_select_title_node(llm))

    graph_builder.add_edge(START, "analyze_offer")
    graph_builder.add_edge("analyze_offer", "select_title")
    graph_builder.add_edge("select_title", END)

    return graph_builder.compile()

