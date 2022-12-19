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
            server_url: "neo4j://localhost:7687",
            server_user: 'neo4j',
            server_password: '123',
            labels: {
                Building: {
                    caption: "Name",
                },
            },
            relationships: {
                RETWEETS: {
                    caption: false,
                    thickness: "count",
                },
            },
            initial_cypher:
                "MATCH (n:Building) RETURN n LIMIT 25",
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
