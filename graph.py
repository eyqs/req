import parser
import graphviz as gv

class Grapher(object):
    def __init__(self):
        self.graph = gv.Digraph(format='png')
        self.graph.graph_attr['ratio'] = "0.25"
        self.graph.graph_attr['center'] = "true"
        self.graph.graph_attr['margin'] = "0.2"
        self.graph.graph_attr['nodesep'] = "0.1"
        self.graph.graph_attr['ranksep'] = "0.5"
        self.graph.node_attr['fontname'] = "Helvetica"
        self.graph.edge_attr['color'] = "0.000 1.000 0.5"
        self.idx = 0

    def plot_graph(self, parent_node, parent_type, tree):
        self.idx += 1
        if isinstance(tree, parser.AndNode):
            if parent_type == "OR": # If OR -> AND, you cannot simplify the graph
                self.graph.node(parent_node, parent_type)
                current_idx = self.idx
                self.graph.edge(parent_node, str(current_idx))
                for sub in tree.children:
                    self.plot_graph(str(current_idx), "AND", sub)
            else:
                for sub in tree.children:
                    self.plot_graph(parent_node, parent_type, sub)
        elif isinstance(tree, parser.OrNode):
            self.graph.node(parent_node, parent_type)
            current_idx = self.idx
            self.graph.edge(parent_node, str(current_idx))
            for sub in tree.children:
                self.plot_graph(str(current_idx), "OR", sub)
        elif isinstance(tree, parser.Course):
            self.graph.node(parent_node, parent_type)
            self.graph.edge(parent_node, tree.name)
        else:
            exit(1) # you done fucked up.

    def render(self):
        src = self.graph.source
        # can do something here to remove duplicate items
        graph = gv.Source(src)
        graph.render(filename='img/g1', view=True)
