import React, { useEffect, useRef } from "react";
import ResizeAware from 'react-resize-aware';
import PropTypes from "prop-types";
// @ts-ignore
import NeoVis from 'neovis.js/dist/neovis.js';

// TODO: use https://github.com/FezVrasta/react-resize-aware/tree/v2.7.2 to make it responsive

// @ts-ignore
const NeoGraph = (props) => {
    const {
        width,
        height,
        containerId,
        backgroundColor,
        neo4jUri,
        neo4jUser,
        neo4jPassword,
    } = props;

    const visRef = useRef();

    useEffect(() => {
        const config = {
            // @ts-ignore
            container_id: visRef.current.id,
            server_url: neo4jUri,
            server_user: neo4jUser,
            server_password: neo4jPassword,
            nodes: {
                shape: 'hexagon',
                font: {
                    color: 'white',
                },
            },
            labels: {
                "DesignEpisode": {
                    "caption": "Name",
                    "size": "pagerank",
                    "community": "community"
                    //"sizeCypher": "defaultSizeCypher"
                },
                "Rooms": {
                    "caption": "Name",
                    "size": "pagerank",
                    "shape": 'square'
                    //"sizeCypher": "defaultSizeCypher"
                }
            },
            relationships: {
                RETWEETS: {
                    caption: false,
                    thickness: "count",
                },
            },
            initial_cypher:
                "MATCH (s:DesignEpisode)-[rel:EpisodeElement]->(d) WHERE ID(s) IN [286, 80] RETURN s, rel, d\n",
        };
        // @ts-ignore
        const vis = new NeoVis(config);
        vis.render();
    }, [neo4jUri, neo4jUser, neo4jPassword]);

    return (
        <div
            id={containerId}
            // @ts-ignore
            ref={visRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: `${backgroundColor}`,
            }}
        />
    );
};

NeoGraph.defaultProps = {
    width: 600,
    height: 600,
    backgroundColor: "#d3d3d3",
};

NeoGraph.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    containerId: PropTypes.string.isRequired,
    neo4jUri: PropTypes.string.isRequired,
    neo4jUser: PropTypes.string.isRequired,
    neo4jPassword: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
};

export default NeoGraph;
