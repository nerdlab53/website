import ast
import networkx as nx
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-path')

class FunctionCallVisitor(ast.NodeVisitor):
    def __init__(self):
        self.graph = nx.DiGraph()
        self.current_function = None

    def visit_FunctionDef(self, node):
        self.current_function = node.name
        self.graph.add_node(node.name)
        self.generic_visit(node)
        self.current_function = None

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            called_function = node.func.id
            if self.current_function and called_function:
                self.graph.add_edge(self.current_function, called_function)
        self.generic_visit(node)

def visualize_graph_3d(graph):
    pos = nx.spring_layout(graph, dim=3)
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    xs, ys, zs = zip(*[pos[v] for v in graph])
    ax.scatter(xs, ys, zs)

    for edge in graph.edges():
        x, y, z = zip(pos[edge[0]], pos[edge[1]])
        ax.plot(x, y, z, "ro-")

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    plt.show()

def analyze_script(script_path):
    with open(script_path, "r") as source:
        tree = ast.parse(source.read())
        visitor = FunctionCallVisitor()
        visitor.visit(tree)
        return visitor.graph

if __name__ == "__main__":
    args = parser.parse_args()
    script_path = args.path
    graph = analyze_script(script_path)
    visualize_graph_3d(graph)