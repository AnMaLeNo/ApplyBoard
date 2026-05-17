from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.llm import JsonLLMClient
from app.nodes.analyze_offer import make_analyze_offer_node


class CvGenerationState(TypedDict, total=False):
    offer: dict[str, Any]
    offer_analysis: dict[str, Any]


def build_graph(llm: JsonLLMClient):
    graph_builder = StateGraph(CvGenerationState)

    graph_builder.add_node("analyze_offer", make_analyze_offer_node(llm))

    graph_builder.add_edge(START, "analyze_offer")
    graph_builder.add_edge("analyze_offer", END)

    return graph_builder.compile()

