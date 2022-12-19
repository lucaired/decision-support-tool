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
        'RETURN labels(element), element.Area, element.TotalSurfaceArea, element.GrossArea, element.GrossSideArea, element.NetSurfaceArea, element.OuterSurfaceArea, element.LoadBearing, element.IsExternal, element.materials'
    const {loading, records, run,} = useReadCypher(q, {ifcmodel: activeVariant.ifcFile})

    useEffect(() => {
        run({ifcmodel: activeVariant.ifcFile}).then(r => {
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
    let elementsMaterialLayerByType = new Map<string, Map<string, object>>();

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
        const netSurfaceArea = record.get('element.NetSurfaceArea')
        const outerSurfaceArea = record.get('element.OuterSurfaceArea')
        const area = record.get('element.Area')
        const grossSideArea = record.get('element.GrossSideArea')

        const totalRecordArea = totalSurfaceArea ? totalSurfaceArea : grossArea ? grossArea : netSurfaceArea ? netSurfaceArea : outerSurfaceArea ? outerSurfaceArea : area? area : grossSideArea ? grossSideArea :0
        const label = record.get('labels(element)')[0]

        const loadBearing = record.get('element.LoadBearing')
        const isExternal = record.get('element.IsExternal')

        let uniqueLayers = new Map();
        [record.get('element.materials')]
            .filter((layers: string) => layers !== undefined && layers !== null)
            .map((layers: string) => {
                let layersObject = JSON.parse(layers)
                // this contains multiple layers
                return Object.entries(layersObject)
            })
            .flat()
            // @ts-ignore
            .forEach((layer) => {
                if (!uniqueLayers.has(layer[0])) {
                    if (layer[0] === '<Unnamed>') {
                        layer[0] = 'Undefined'
                    }
                    uniqueLayers.set(layer[0], layer[1])
                }
            })
        // @ts-ignore
        const elementHasLayersDefined = Array.from(uniqueLayers.values()).some((layer) => Object.hasOwn(layer, 'LayerThickness'))        

        const key = `${label}${loadBearing ? ' load-bearing' : ''}${isExternal ? ' external' : ''} ${elementHasLayersDefined ? ' defined': ' undefined'}`

        let totalElementArea = elementAreasByElementType.get(key)
        totalElementArea = totalElementArea ? totalElementArea += totalRecordArea : totalRecordArea

        elementAreasByElementType.set(key, totalElementArea || 0)

        if (elementsMaterialLayerByType.has(key)) {
            const layersUpdate = new Map([
                // @ts-ignore
                ...Array.from(elementsMaterialLayerByType.get(key).entries()), 
                ...Array.from(uniqueLayers.entries())
            ]);
            elementsMaterialLayerByType.set(key, layersUpdate)
        } else {
            elementsMaterialLayerByType.set(key, uniqueLayers)
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
        const elementsMaterialLayers = elementsMaterialLayerByType.get(elementType)
        return elementsMaterialLayers || new Map()
    }

    const getGWPForLayer = (layerName: string, layer: Object): number|Array<number> => {
        /*
            Layers are undefined:
            - layerName is element of {<Unnamed>, Default Wall}
            - LayerThickness is undefined
        */ 
        let gwp: number|Array<number> = layerName.length * 10
        if (!layer.hasOwnProperty('LayerThickness')) {
            gwp = [gwp, gwp * 2]
        } else {
            // @ts-ignore
            gwp = gwp * layer['LayerThickness']
        }

        return gwp
    }

    const getLabels = () => {
        return decisionLevel === 0 ? ['Whole Building'] :
            decisionLevel === 1 ? Array.from(elementAreasByElementType.keys()) :
                // @ts-ignore
                decisionLevel === 2 ? Array.from(getLayersForElementType().keys()):
                        []
    }

    const getGWPForBuildingPart = (elementType: string) => {
        // calculate GWP as point value using all layers, if no layers are set we fall back to the area
        const layers = elementsMaterialLayerByType.get(elementType) || new Map()
        const area = elementAreasByElementType.get(elementType) || 1

        if (elementType === 'Proxy  undefined') {
            return  [area / 5, area * 2 / 5]
        }

        let gwpForBuildingPart;

        if (Array.from(layers.keys()).length === 0) {
            gwpForBuildingPart = [area, area * 2]
            return gwpForBuildingPart
        }

        const gwpSumOfLayers = Array.from(layers.entries()).map((layer) => getGWPForLayer(layer[0], layer[1]))
        for (const gwpResult of gwpSumOfLayers) {
            if (typeof gwpResult === 'number') {
                if (!gwpForBuildingPart) {
                    gwpForBuildingPart = 0
                }
                // @ts-ignore
                gwpForBuildingPart += gwpResult
            } else {
                if (!gwpForBuildingPart) {
                    gwpForBuildingPart = [0,0]
                }
                // @ts-ignore
                gwpForBuildingPart = [gwpForBuildingPart[0] + gwpResult[0] * area, gwpForBuildingPart[1] + gwpResult[1] * area]
            }
        }
        return gwpForBuildingPart || 0
    }

     const getData = () => {
        return decisionLevel === 0 ? [totalBuildingArea, totalBuildingArea * 1.5] :
            decisionLevel === 1 ? Array.from(elementsMaterialLayerByType.keys()).map(elementType => getGWPForBuildingPart(elementType)) :
                // @ts-ignore
                decisionLevel === 2 ? Array.from(getLayersForElementType().entries()).map((entry) => getGWPForLayer(entry[0], entry[1])) :
                        []
    }

    const getBarFillColor = (data: Array<number|Array<number>>) => {
        let largestValue = 0;
        let index = -1;
        let fillColor = data.map((datum: number | Array<number>, current_index: number) => {
            let current_value = 0
            if (typeof(datum) !== 'number') {
                current_value = datum[1] - datum[0]
            } else {
                current_value = datum
            }
            if (current_value > largestValue) {
                largestValue = current_value
                index = current_index;
            }
            return "#E3E3E3"
        });
        if (index !== -1) {
            fillColor[index] = '#FF000080'
        }
        return fillColor
    }

    const generated_data = getData()

    const data = {
        labels: getLabels(),
        datasets: [
            {
                label: 'GWP in t CO2-eq',
                data: generated_data,
                backgroundColor: getBarFillColor(generated_data),
            },
        ],
    };

    return (
        <div>
            {decisionLevel !== 0 && <Button onClick={() => handleChartNavigation()}>Back</Button>}
            {data.datasets[0].data.length > 0 ? <Bar
                options={options}
                data={data}
                ref={chartRef}
                onClick={(event) => onClick(event, handleElementIndex)}
            /> : <p>Level of Detail contains no layer information</p>}
        </div>
    );
}


export default GWPEvaluation