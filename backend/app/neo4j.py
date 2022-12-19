from dataclasses import dataclass
from neo4j import GraphDatabase, basic_auth
import os

#uri = os.getenv("NEO4J_URI", "neo4j://10.195.6.112:7687")  #
#username = os.getenv("NEO4J_USER", "neo4j")
#password = os.getenv("NEO4J_PASSWORD", "123")
uri = "neo4j://10.195.6.112:7687"
username = "neo4j"
password = "123"

neo4jVersion = os.getenv("NEO4J_VERSION", "4")
database = os.getenv("NEO4J_DATABASE", "neo4j")

@dataclass
class DE:
    Guid: str
    description: str

class Neo4JGraph:

    def __init__(self):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))

    def close(self):
        self.driver.close()

    @staticmethod
    def _query_all_design_episode_descriptions(tx):
        result = tx.run("MATCH (n:DesignEpisode) RETURN n.Guid, n.Description")
        return [record.values() for record in result]
    
    def query_all_design_episode_descriptions(self) -> list[DE]:
        with self.driver.session() as session:
            all_id_and_description = session.read_transaction(self._query_all_design_episode_descriptions)
            return list(map(lambda element: DE(Guid=element[0], description=element[1]), all_id_and_description))

