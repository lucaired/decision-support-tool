from dataclasses import dataclass
from functools import reduce
from neo4j import GraphDatabase, basic_auth
import os

uri = os.getenv("DE_NEO4J_URL", "neo4j://10.195.6.112:7687")  #
username = os.getenv("DE_NEO4J_USER", "neo4j")
password = os.getenv("DE_NEO4J_PASSWORD", "123")
neo4jVersion = os.getenv("DE_NEO4J_VERSION", "4")
database = os.getenv("DE_NEO4J_DATABASE", "neo4j")

@dataclass
class DE:
    Guid: str
    description: str
    name: str
    explanation_tags: list[str]

class Neo4JGraph:

    def __init__(self):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))

    def close(self):
        self.driver.close()

    @staticmethod
    def _query_all_design_episode_descriptions(tx, project_de_ids: list[str]):
        result = tx.run("""
        MATCH (d:DesignEpisode)-[EpisodeElement]->(m)
        WHERE NOT d.Guid IN $project_de_ids
        RETURN d.Guid, d.Description, Collect(distinct m.ExplanationTags), d.Name
        """, project_de_ids=project_de_ids)
        return [record.values() for record in result]
    
    def query_all_design_episode_descriptions(self, project_de_ids: list[str]) -> list[DE]:
        with self.driver.session() as session:
            all_id_and_description = session.read_transaction(self._query_all_design_episode_descriptions, project_de_ids)
            return list(
                map(
                    lambda element: DE(
                        Guid=element[0],
                        description=element[1],
                        explanation_tags=_flatten_explanation_tags(element[2]),
                        name=element[3]
                        ),
                    all_id_and_description
                )
            )
    
def _flatten_explanation_tags(explanation_tags_list: list[list[str]]) -> list[str]:
    def extend_list(acc: list[str], curr_list: list[str]) -> list[str]:
        acc.extend(curr_list) 
        return acc
    return list(set(reduce(extend_list, explanation_tags_list, [])))


