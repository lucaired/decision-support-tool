import {useReadCypher} from "use-neo4j";
import {useEffect, useRef, useState} from 'react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import {Bar, getElementAtEvent} from 'react-chartjs-2';
import Button from "@mui/material/Button";
import * as React from "react";
import {faker} from '@faker-js/faker';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// @ts-ignore
function GWPEvaluation({activeVariant}) {
    // use essential building elements for BoQ
    const q = 'MATCH (b:Building {ifcmodel: $ifcmodel})-[:has]->(:Storey)-[:has]->(element)' +
        'WHERE (not (element:Space))' +
        'RETURN labels(element), element.TotalSurfaceArea, element.GrossArea, element.GrossSideArea, element.LoadBearing, element.IsExternal'
    const {loading, records, run,} = useReadCypher(q, {ifcmodel: activeVariant.neo4JReference})

    useEffect(() => {
        run({ifcmodel: activeVariant.neo4JReference}).then(r => {
        })
    }, [activeVariant])

    const decisionLevelTitle = ['Construction Level', 'Building Part Level', 'Layer Level', 'Layer Level']
    const [decisionLevel, setDecisionLevel] = useState(0)
    const handleSetDecisionLevel = (level: number) => setDecisionLevel(level)

    if (loading) return (<div>Loading...</div>)

    return <div>
            <Button style={{background: "green", color: "white"}}>{decisionLevelTitle[decisionLevel]}</Button>
            <BuildingEvaluation
                records={records}
                decisionLevel={decisionLevel}
                handleSetDecisionLevel={handleSetDecisionLevel}
            />
        </div>
}

// @ts-ignore
function BuildingEvaluation({records, decisionLevel, handleSetDecisionLevel}) {

    let elementsByElementType = new Map<string, number>();

    const [elementIndex, setElementIndex] = React.useState(-1);
    const handleElementIndex = (index: number) => {
        if (decisionLevel !== 3) {
            setElementIndex(index)
            handleSetDecisionLevel(decisionLevel + 1)
        }
    }

    let totalBuildingArea = 0

    // @ts-ignore
    records?.forEach(record => {
        const totalSurfaceArea = record.get('element.TotalSurfaceArea')
        const grossArea = record.get('element.GrossArea')
        const grossSideArea = record.get('element.GrossSideArea')

        const totalRecordArea = totalSurfaceArea ? totalSurfaceArea : grossArea ? grossArea : grossSideArea ? grossSideArea : 0
        const label = record.get('labels(element)')[0]
        const loadBearing = record.get('element.LoadBearing')
        const isExternal = record.get('element.IsExternal')

        const key = `${label}${loadBearing ? ' load-bearing' : ''}${isExternal ? ' external' : ''}`

        let totalElementArea = elementsByElementType.get(key)
        totalElementArea = totalElementArea ? totalElementArea += totalRecordArea : totalRecordArea

        elementsByElementType.set(key, totalElementArea || 0)

        totalBuildingArea += totalElementArea || 0
    })
    
    const chartRef = useRef();

    // get element index from the data-series
    const onClick = (
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
        handleElementIndex: (index: number) => void) => {
        // @ts-ignore
        const element = getElementAtEvent(chartRef.current, event)
        if (element !== undefined) {
            if (element[0] !== undefined) {
                handleElementIndex(element[0].index)
            }
        }
    }

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Global Warming Potential',
            },
        },
    };

    const getLabels = () => {
        return decisionLevel === 0 ? ['Whole Building']:
            decisionLevel === 1 ? Array.from(elementsByElementType.keys()):
            decisionLevel === 2 ? ["Layer 1", "Layer 2", "Layer 3", "Layer 4"]:
            decisionLevel === 3 ? ["Material 1", "Material 2", "Material 3", "Material 4"]:
                []
    }

    const getData = () => {
        return decisionLevel === 0 ? [totalBuildingArea * 1.5, totalBuildingArea * 3.5]:
            decisionLevel === 1 ? Array.from(elementsByElementType.values()).map(value => [value * Math.random(), value]):
                decisionLevel === 2 ? ["Wood frame 1", "Wood frame 2", "Wood solid 1", "Wood solid 2"].map(() => {
                        let gwp: number = faker.datatype.number({min: 0, max: 1000})
                        return [gwp, gwp * 2]
                    }):
                    decisionLevel === 3 ? ["Material 1", "Material 2", "Material 3", "Material 4"].map(() => {
                        let gwp: number = faker.datatype.number({min: 0, max: 1000})
                        return [gwp, gwp * 2]
                    }):
                    []
    }

    const data = {
        labels: getLabels(),
        datasets: [
            {
                label: 'GWP in t CO2-eq',
                data: getData()
            },
        ],
    };

    function handleChartNavigation() {
        if (decisionLevel !== 0) {
            handleSetDecisionLevel(decisionLevel - 1)
            setElementIndex(-1)
        }
    }

    return (
        <div>
            {decisionLevel !== 0 && <Button onClick={() => handleChartNavigation()}>Back</Button>}
             <Bar
                options={options}
                data={data}
                ref={chartRef}
                onClick={(event) => onClick(event, handleElementIndex)}
             />
        </div>
    );
}


export default GWPEvaluation