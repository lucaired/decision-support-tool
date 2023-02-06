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

package = "en_core_web_trf"
nlp = spacy.load(package)
nlp.add_pipe('universal_sentence_encoder')
# 063d866c06683311b44b4992fd46003be952409c

@dataclass
class MatchingResult:
    source_de_guuid: str
    result_de_id: str
    similarity: float

@dataclass
class MatchedDe:
    de_id: str
    aggregated_similarity: float
    frequency: int

async def match_design_episodes_by_description_and_tags(source_de_guuid: str, project_de_ids: list[str]) -> list[MatchingResult]:
    try:
        neo = Neo4JGraph()
        all_design_episode_descriptions: list[DE] = neo.query_all_design_episode_descriptions([])
        logger.info(f"{len(all_design_episode_descriptions)} DEs to retrieved")
    except Exception as e:
        logger.error(e)
        return []

    logger.info(f"Start matching with source_de_guuid:{source_de_guuid}")

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

    doc1 = _parse_description(nlp, source_de)
    logger.info('Parsing of source DE done, proceeding with search set')
    matching_results = []

    # exclude the DEs from the project
    for de in list(filter(lambda de: de.Guid not in project_de_ids, all_design_episode_descriptions)):
        doc2 = _parse_description(nlp, de)
        description_similiarity = max(doc2.similarity(doc1), 0)
        tag_similarity = _overlap_coefficient(source_de.explanation_tags, de.explanation_tags)
        sim = description_similiarity + tag_similarity
        matching_results.append(MatchingResult(source_de_guuid, de.Guid, sim))
        logger.info(f'Matching search DE:{de.Guid}')

    logger.info(f'Matching DE:{source_de.Guid} done, {len(matching_results)} other DEs found')
    return matching_results

def _parse_description(nlp, source_de):
    try: 
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
    except Exception as exception:
        logger.error(f'Could not parse description {exception}')
        return None

def _overlap_coefficient(list1: list[str], list2: list[str]) -> float:
    list1 = [x.lower() for x in list1]
    list2 = [x.lower() for x in list2]
    size_intersection = len(set(list1).intersection(list2))
    return float(size_intersection) / min(len(list1), len(list2))

def boost_by_weight(all_matchings: list[MatchingResult], weights: dict) -> list[MatchingResult]:
    def boost_similarity(matching: MatchingResult):
        if matching.result_de_id in weights:
            matching.similarity = matching.similarity + matching.similarity * 0.1 * weights[matching.result_de_id]
        return matching

    return list(map(boost_similarity, all_matchings))

def aggregate_similarity_for_matched_de(all_matchings: list[MatchingResult]) -> list[MatchedDe]:
    frequency_map = {}

    for matching in all_matchings:
        if matching.result_de_id in frequency_map:
            matched_de: MatchedDe = frequency_map[matching.result_de_id]
            frequency_map[matching.result_de_id] = MatchedDe(
                matching.result_de_id,
                matched_de.aggregated_similarity + matching.similarity,
                matched_de.frequency+1
            )
        else:
            frequency_map[matching.result_de_id] = MatchedDe(matching.result_de_id, matching.similarity, 1)
    return list(frequency_map.values())

def normalize_aggregated_similarity(all_matched_de: list[MatchedDe]) -> list[MatchedDe]:
    return list(map(
        lambda matched_de: MatchedDe(
            matched_de.de_id,
            matched_de.aggregated_similarity/matched_de.frequency,
            matched_de.frequency)
        , all_matched_de
        ))

def get_best_matching_design_episodes(all_matched_de: list[MatchedDe]) -> list[MatchedDe]:
    def useSimilarity(matched_de: MatchedDe):
        return matched_de.aggregated_similarity

    all_matched_de.sort(key=useSimilarity)
    for match in all_matched_de:
        print(match)
    best_matching = all_matched_de[-5:] if len(all_matched_de) >= 5 else all_matched_de
    best_matching.reverse()
    return best_matching