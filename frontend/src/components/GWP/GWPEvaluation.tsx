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
        'RETURN labels(element), element.TotalSurfaceArea, element.GrossArea, element.GrossSideArea, element.LoadBearing, element.IsExternal, element.materials'
    const {loading, records, run,} = useReadCypher(q, {ifcmodel: activeVariant.neo4JReference})

    useEffect(() => {
        run({ifcmodel: activeVariant.neo4JReference}).then(r => {
        })
    }, [activeVariant])

    const decisionLevelTitle = ['Construction Level', 'Building Part Level', 'Layer Level']
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

    let elementAreasByElementType = new Map<string, number>();
    let elementsMaterialLayerByType = new Map<string, string[]>();

    const [elementIndex, setElementIndex] = React.useState<object>({});
    const handleElementIndex = (index: number) => {
        if (decisionLevel !== 2) {
            if (decisionLevel === 0) {
                setElementIndex({...elementIndex, 0: index})
            } else if (decisionLevel === 1) {
                setElementIndex({...elementIndex, 1: index})
            }
            const newDecisionLevel = decisionLevel + 1
            handleSetDecisionLevel(newDecisionLevel)
        }
    }

    function handleChartNavigation() {
        if (decisionLevel !== 0) {
            if (decisionLevel === 1) {
                setElementIndex({...elementIndex, 1: -1})
            } else if (decisionLevel === 2) {
                setElementIndex({...elementIndex, 2: -1})
            }
            const newDecisionLevel = decisionLevel - 1
            handleSetDecisionLevel(newDecisionLevel)
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

        let totalElementArea = elementAreasByElementType.get(key)
        totalElementArea = totalElementArea ? totalElementArea += totalRecordArea : totalRecordArea

        elementAreasByElementType.set(key, totalElementArea || 0)

        if (elementsMaterialLayerByType.has(key)) {
            elementsMaterialLayerByType.set(key, [...elementsMaterialLayerByType.get(key) || [], record.get('element.materials')])
        } else {
            elementsMaterialLayerByType.set(key, [record.get('element.materials')])
        }

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

    const getLayersForElementType = (): Map<string, object> => {
        // @ts-ignore
        const elementTypeIndex = elementIndex['1']
        const elementType = Array.from(elementAreasByElementType.keys())[elementTypeIndex]
        const elementsMaterialLayers = elementsMaterialLayerByType.get(elementType) || []

        let uniqueLayers = new Map();
        const layers = elementsMaterialLayers
            .filter((layers: string) => layers !== undefined && layers !== null)
            .map((layers: string) => {
                let layersObject = JSON.parse(layers)
                // this contains multiple layers
                return Object.entries(layersObject)
            })
            // @ts-ignore
            .flat()
            .map((layer) => {
                if (!uniqueLayers.has(layer[0])) {
                    uniqueLayers.set(layer[0], layer[1])
                }
            })
        return uniqueLayers
    }

    const getLabels = () => {
        return decisionLevel === 0 ? ['Whole Building'] :
            decisionLevel === 1 ? Array.from(elementAreasByElementType.keys()) :
                // @ts-ignore
                decisionLevel === 2 ? Array.from(getLayersForElementType().keys()):
                        []
    }

    const getData = () => {
        return decisionLevel === 0 ? [totalBuildingArea * 1.5, totalBuildingArea * 3.5] :
            decisionLevel === 1 ? Array.from(elementAreasByElementType.values()).map(value => [value * Math.random(), value]) :
                // TODO: get data from oracle
                // @ts-ignore
                decisionLevel === 2 ? Array.from(getLayersForElementType().keys()).map(() => {
                        let gwp: number = faker.datatype.number({min: 0, max: 1000})
                        return [gwp, gwp * 2]
                    }) :
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