from dataclasses import dataclass
import spacy

from app.neo4j import Neo4JGraph, DE

@dataclass
class MatchingResult:
    source_de_id: str
    result_de_id: str
    similarity: float

def match_design_episodes_by_description(source_de_id: str) -> list[MatchingResult]:

    neo = Neo4JGraph()
    all_design_episode_descriptions: list[DE] = neo.query_all_design_episode_descriptions()
    print(all_design_episode_descriptions)
    if not (source_de := filter(lambda de: de.id == source_de_id, all_design_episode_descriptions)):
        return []

    package = "en_core_web_lg"
    nlp = spacy.load(package)
    nlp.add_pipe('universal_sentence_encoder')

    source_de = source_de[0]
    doc1 = nlp(source_de.description)
    # remove stopwords
    resultB = []
    for token in doc1:
        if token.text in nlp.Defaults.stop_words:
            continue
        if token.is_punct:
            continue
        if token.pos_ == 'PRON':
            continue
        resultB.append(token.lemma_)
    doc1 = nlp(" ".join(resultB))

    matching_results = []

    for de in (all_design_episode_descriptions.filter(lambda de: de.id != source_de_id)):
        doc2 = nlp(de.description)
        # remove stopwords
        resultA = []
        for token in doc2:
            if token.text in nlp.Defaults.stop_words:
                continue
            if token.is_punct:
                continue
            if token.pos_ == 'PRON':
                continue
            resultA.append(token.lemma_)
        doc2 = nlp(" ".join(resultA))
        sim = doc2.similarity(doc1)
        sim = max(sim, 0)
        matching_results.append(MatchingResult(source_de_id, de.id, sim))

    return matching_results

def get_best_matching_design_episodes(all_matchings: list[MatchingResult]) -> list[MatchingResult]:
    def useSimilarity(matching_result: MatchingResult):
        return matching_result.similarity

    all_matchings.sort(key=useSimilarity)
    best_matching = all_matchings[-3:] if len(all_matchings) >= 3 else all_matchings
    best_matching.reverse()
    return best_matching