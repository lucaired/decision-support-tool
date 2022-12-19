from dataclasses import dataclass
import logging
from sys import stdout
import spacy

from app.neo4j import Neo4JGraph, DE

logger = logging.getLogger('mylogger')
logger.setLevel(logging.DEBUG) # set logger level
logFormatter = logging.Formatter\
("%(name)-12s %(asctime)s %(levelname)-8s %(filename)s:%(funcName)s %(message)s")
consoleHandler = logging.StreamHandler(stdout) #set streamhandler to stdout
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)

@dataclass
class MatchingResult:
    source_de_guuid: str
    result_de_id: str
    similarity: float

def match_design_episodes_by_description(source_de_guuid: str) -> list[MatchingResult]:
    logger.info(f"Start matching with source_de_guuid:{source_de_guuid}")
    neo = Neo4JGraph()
    all_design_episode_descriptions: list[DE] = neo.query_all_design_episode_descriptions()

    gen = (
        de for de in all_design_episode_descriptions
        if de.Guid == source_de_guuid
    )

    try: 
        source_de = next(gen)
    except StopIteration as stop_iteration:
        logger.warning(f'Source DE:{source_de_guuid} not found')
        return []

    logger.info(f'Now parsing source DE:{source_de.Guid}')
    package = "en_core_web_trf"
    nlp = spacy.load(package)
    nlp.add_pipe('universal_sentence_encoder')

    doc1 = _parse_description(nlp, source_de)
    logger.info('Parsing of source DE done, proceeding with search set')
    matching_results = []

    logger.info(f'Matching target DE:{source_de.Guid}')
    for de in list(filter(lambda de: de.Guid != source_de_guuid, all_design_episode_descriptions)):
        doc2 = _parse_description(nlp, de)
        sim = doc2.similarity(doc1)
        sim = max(sim, 0)
        matching_results.append(MatchingResult(source_de_guuid, de.Guid, sim))

    logger.info(f'Matching DE:{source_de.Guid} done, {len(matching_results)} other DEs found')
    return matching_results


def _parse_description(nlp, source_de):
    result = nlp(source_de.description)
    # remove stopwords
    resultB = []
    for token in result:
        if token.text in nlp.Defaults.stop_words:
            continue
        if token.is_punct:
            continue
        if token.pos_ == 'PRON':
            continue
        resultB.append(token.lemma_)
    result = nlp(" ".join(resultB))
    return result


def get_best_matching_design_episodes(all_matchings: list[MatchingResult]) -> list[MatchingResult]:
    def useSimilarity(matching_result: MatchingResult):
        return matching_result.similarity

    all_matchings.sort(key=useSimilarity)
    best_matching = all_matchings[-3:] if len(all_matchings) >= 3 else all_matchings
    best_matching.reverse()
    return best_matching