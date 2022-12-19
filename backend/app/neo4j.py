import os
from neo4j import GraphDatabase, basic_auth

url = os.getenv("NEO4J_URI", "neo4j://10.195.6.112:7687")  #
username = os.getenv("NEO4J_USER", "neo4j")
password = os.getenv("NEO4J_PASSWORD", "123")

neo4jVersion = os.getenv("NEO4J_VERSION", "4")
database = os.getenv("NEO4J_DATABASE", "neo4j")

driver = GraphDatabase.driver(url, auth=basic_auth(username, password))

def get_db():
    if not hasattr(g, 'neo4j_db'):
        if neo4jVersion.startswith("4"):
            g.neo4j_db = driver.session(database=database)
        else:
            g.neo4j_db = driver.session()
    return g.neo4j_db


def query_design_episode_by_id(id: str):
    pass

class DE:
    id: str
    description: str

def query_all_design_episode_descriptions() -> list[DE]:
    db = get_db()
    all_id_and_description = db.read_transaction(lambda tx: list(tx.run("MATCH (n:DesignEpisode) RETURN id(n), n.Description")))
    return list(map(lambda element: DE(id=element[0], description=element[1]), all_id_and_description))