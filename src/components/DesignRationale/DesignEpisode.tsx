import React from "react";
import NeoGraph from "./NeoGraph";

const NEO4J_URI = "neo4j://localhost:7687";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "123";

const DesignEpisode = () => {
    return (
        <div style={{display: 'flex', justifyContent: "center"}}>
            <NeoGraph
                width={800}
                height={500}
                containerId={"id1"}
                neo4jUri={NEO4J_URI}
                neo4jUser={NEO4J_USER}
                neo4jPassword={NEO4J_PASSWORD}
                backgroundColor={"#ffffff"}
            />
        </div>
    );
};

export default DesignEpisode;