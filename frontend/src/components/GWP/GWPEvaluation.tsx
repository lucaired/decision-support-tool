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
import { Stack, Chip } from "@mui/material";

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

    const decisionLevelTitle = ['Construction Level', 'General Building Part Level', 'Building Part Level', 'Layer Level']
    const [decisionLevel, setDecisionLevel] = useState(0)
    const handleSetDecisionLevel = (level: number) => setDecisionLevel(level)

    if (loading) return (<div>Loading...</div>)

    return (
        // @ts-ignore
        <div>{records?.length > 0 ? 
        <div>
            <Button style={{background: "green", color: "white"}}>{decisionLevelTitle[decisionLevel]}</Button>
            <BuildingEvaluation
                activeVariant={activeVariant}
                records={records}
                decisionLevel={decisionLevel}
                handleSetDecisionLevel={handleSetDecisionLevel}
            />  
         </div> : <div>No Global Warming Potential evaluation possible - no IFC file was imported.</div>}
    </div>)
}

// @ts-ignore
function BuildingEvaluation({activeVariant, records, decisionLevel, handleSetDecisionLevel}) {

    let elementAreasByBuildingPart = new Map<string, number>();
    let elementLayerSetByBuildingPart = new Map<string, Map<string, Object>>();
    let elementLayerSetByBuildingPartCount = new Map<string, number>();

    // Internal building part category to Node label
    let buildingPartLabelToNodeLabel = new Map<string, string>();
    let nodeLabelToElementTypeAreaSet = new Map<string, Map<string, number>>();
    let nodeLabelToMaterialLayerSet = new Map<string, Map<string, Object>>();

    const [elementIndex, setElementIndex] = React.useState<object>({});

    const handleElementIndex = (index: number) => {
        // The indices are detected by the bar-chart component supplying information on what 
        // element of the sorted array has been clicked. Since the original array will be unsorted
        // we have to identify the correct index to show the right dataset in the next decision level.

        if (decisionLevel !== 3) {
            if (decisionLevel === 0) {
                setElementIndex({...elementIndex, 0: index})
            } else if (decisionLevel === 1) {
                // @ts-ignore
                const label = getGeneralBuildingPartLabels().sort()[index]
                // @ts-ignore
                const unsortedIndex = getGeneralBuildingPartLabels().indexOf(label)
                setElementIndex({...elementIndex, 1: unsortedIndex})
            } else if (decisionLevel === 2) {
                // @ts-ignore
                const label = Array.from(getBuildingParts(elementIndex['1']).keys()).sort()[index]
                // @ts-ignore
                const unsortedIndex = Array.from(getBuildingParts(elementIndex['1']).keys()).indexOf(label)
                setElementIndex({...elementIndex, 2: unsortedIndex})
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
            } else if (decisionLevel === 3) {
                setElementIndex({...elementIndex, 3: -1})
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
        buildingPartLabelToNodeLabel.set(key, label)

        let totalElementArea = elementAreasByBuildingPart.get(key)
        totalElementArea = totalElementArea ? totalElementArea += totalRecordArea : totalRecordArea

        elementAreasByBuildingPart.set(key, totalElementArea || 0)

        if (elementLayerSetByBuildingPartCount !== undefined && elementLayerSetByBuildingPartCount.has(key)) {
            // @ts-ignore
            elementLayerSetByBuildingPartCount.set(key, elementLayerSetByBuildingPartCount.get(key)+1)
        } else {
            elementLayerSetByBuildingPartCount.set(key, 1)
        }

        if (elementLayerSetByBuildingPart.has(key)) {
            const layersUpdate = new Map([
                // @ts-ignore
                ...Array.from(elementLayerSetByBuildingPart.get(key).entries()), 
                ...Array.from(uniqueLayers.entries())
            ]);
            elementLayerSetByBuildingPart.set(key, layersUpdate)
        } else {
            elementLayerSetByBuildingPart.set(key, uniqueLayers)
        }

        totalBuildingArea += totalElementArea || 0
    })

    // element types without area greater than 0 or no layer set should be removed
    Array.from(elementAreasByBuildingPart.keys()).forEach((elementType) => {
        const noArea = elementAreasByBuildingPart.get(elementType) === 0;
        if (noArea) {
            elementAreasByBuildingPart.delete(elementType)
        }
        const noLayerSet = elementLayerSetByBuildingPart.get(elementType)?.size == 0;
        if (noLayerSet) {
            elementLayerSetByBuildingPart.delete(elementType)
        }
        if (noArea && noLayerSet) {
            buildingPartLabelToNodeLabel.delete(elementType)
        }
    })
    
    // build a mapping from the original labels to to sets of buildingParts
    // two sets one with the area infos and one with the layerSets 
    buildingPartLabelToNodeLabel.forEach((nodeLabel, buildingPartLabel, map) => {
        const area = elementAreasByBuildingPart?.get(buildingPartLabel);

        if (area && area !== 0) {
            if (nodeLabelToElementTypeAreaSet.has(nodeLabel)) {
                const map = nodeLabelToElementTypeAreaSet.get(nodeLabel) || new Map<string, number>();
                map.set(buildingPartLabel, area);
                nodeLabelToElementTypeAreaSet.set(nodeLabel, map)
            } else {
                nodeLabelToElementTypeAreaSet.set(
                    nodeLabel,
                    new Map([[buildingPartLabel, area]])
                )
            }
        }

        const layerSet = elementLayerSetByBuildingPart?.get(buildingPartLabel);

        if (layerSet && layerSet.size !== 0) {
            if (nodeLabelToMaterialLayerSet.has(nodeLabel)) {
                const map = nodeLabelToMaterialLayerSet.get(nodeLabel) || new Map<string, Object>();
                map.set(buildingPartLabel, layerSet);
                nodeLabelToMaterialLayerSet.set(nodeLabel, map)
            } else {
                nodeLabelToMaterialLayerSet.set(
                    nodeLabel,
                    new Map([[buildingPartLabel, layerSet]])
                )
            }
        }
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
            legend: {
                display: false,
            }
        },
    };

    const getLayersForBuildingPart = (buildingPartIndex: number): Map<string, object> => {
        // extract element index from decision level for building parts
        // @ts-ignore
        const elementTypeIndex = elementIndex['2']
        const buildingPart = Array.from(getBuildingParts(buildingPartIndex).keys())[elementTypeIndex]
        const elementsMaterialLayers = elementLayerSetByBuildingPart.get(buildingPart)
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
            gwp = [gwp, gwp * (1+1/(activeVariant.pathLength**2))]
        } else {
            // @ts-ignore
            gwp = gwp * layer['LayerThickness']
        }

        return gwp
    }

    const getBuildingParts = (elementTypeIndex: number) => {
        // extract element index from decision level for general building parts
        const generalBuildingPartName = getGeneralBuildingPartLabels()[elementTypeIndex]
        const buildPartsWithArea = nodeLabelToElementTypeAreaSet.get(generalBuildingPartName)
        const buildPartsWithLayerSet = nodeLabelToMaterialLayerSet.get(generalBuildingPartName)
        const buildingParts = new Map();
        
        // use the layers sets first
        buildPartsWithLayerSet?.forEach((layerSet, buildingPartName) => buildingParts.set(buildingPartName, layerSet));
        buildPartsWithArea?.forEach((area, buildingPartName) => {
            if (!buildingParts.has(buildingPartName)) {
                buildingParts.set(buildingPartName, area)
            }
        });
        return buildingParts
    }

    const getGWPForBuildingPart = (buildingPart: string) => {
        // calculate GWP as point value using all layers, if no layers are set we fall back to the area
        const layers = elementLayerSetByBuildingPart.get(buildingPart) || new Map()
        const area = elementAreasByBuildingPart.get(buildingPart) || 1

        if (buildingPart === 'Proxy  undefined') {
            // TODO: check this
            return  [area / 5, area * 2 / 5]
        }

        let gwpForBuildingPart;

        // only use the area if we don't have layer information available with an early return
        if (Array.from(layers.keys()).length === 0) {
            gwpForBuildingPart = [area, area * (1+1/(activeVariant.pathLength**2))]
            return gwpForBuildingPart
        }

        // otherwise use the layer information

        const gwpSumOfLayers = Array.from(layers.entries()).map((layer) => getGWPForLayer(layer[0], layer[1]))
        
        // number elements of the buildingPart type with this specific layer set
        const elementCount = elementLayerSetByBuildingPartCount.get(buildingPart) || 0

        for (const gwpResult of gwpSumOfLayers) {
            if (typeof gwpResult === 'number') {
                if (!gwpForBuildingPart) {
                    gwpForBuildingPart = 0
                }
                // @ts-ignore
                gwpForBuildingPart += gwpResult * elementCount
            } else {
                if (!gwpForBuildingPart) {
                    gwpForBuildingPart = [0,0]
                }
                // @ts-ignore
                gwpForBuildingPart = [gwpForBuildingPart[0] + gwpResult[0] * elementCount, gwpForBuildingPart[1] + gwpResult[1] * elementCount]
            }
        }

        // return gwp from layers
        return gwpForBuildingPart || 0
    }

    const getGeneralBuildingPartLabels = () => {
        return Array.from(
            new Set([
                // @ts-ignore
                ...nodeLabelToElementTypeAreaSet.keys() || [],
                // @ts-ignore
                ...nodeLabelToMaterialLayerSet.keys() || []
            ])
        );
    }

    const getGWPForGeneralBuildingPart = (generalBuildingPartName: string) => {
        // building part is either name,area or name,layerSet which come from the 
        // merge the information from the all the building parts for the general building part
        const buildPartsWithAreaKeys = nodeLabelToElementTypeAreaSet.get(generalBuildingPartName)?.keys() || []
        const buildPartsWithLayerSetKeys = nodeLabelToMaterialLayerSet.get(generalBuildingPartName)?.keys() || []
        const buildingParts = Array.from(new Set([
            // @ts-ignore
            ...buildPartsWithAreaKeys,
            // @ts-ignore
            ...buildPartsWithLayerSetKeys,
        ]))
        
        let largestValue = 0;
        // @ts-ignore
        let smallestValue = undefined;

        let totalPointValues = 0;

        // do not predefine min,max
        buildingParts
            .map((buildingPart) => [buildingPart, getGWPForBuildingPart(buildingPart)])
            .forEach((buildingPartAndGwp) => {
                // gwp is either a point value or a min,max tuple
                // hence the totalGWP will be either the sum of all point values or a range that
                // includes the lowest point or range minimum and also the largest point or range value
                const gwp = buildingPartAndGwp[1]

                if (typeof(gwp)==='number') {
                    totalPointValues += gwp
                } else {
                    // @ts-ignore
                    const minimum = gwp[0]
                    // @ts-ignore
                    if (!smallestValue) {
                        // @ts-ignore
                        smallestValue = minimum
                    }
                    // @ts-ignore
                    if (minimum < smallestValue) {
                        // @ts-ignore
                        smallestValue = minimum
                    }
                    // add the size of the intervall
                    largestValue += gwp[1] 
                }
            });

        smallestValue = smallestValue !== undefined ? smallestValue : 0;
        if (smallestValue !== 0) {
            smallestValue += totalPointValues
        }
        largestValue += totalPointValues
        return [smallestValue, largestValue]
    }

    const getGWPForWholeBuilding = () => {
        const result = getGeneralBuildingPartLabels()
            .map((generalBuildingPartName) => getGWPForGeneralBuildingPart(generalBuildingPartName))
            .reduce((acc, curr) => {
                acc[0] += curr[0]
                acc[1] += curr[1]
                return acc
            }, [0,0]);
        return result;
    }

    const getLabels = () => {
        return decisionLevel === 0 ? ['Whole Building'] :
            decisionLevel === 1 ? getGeneralBuildingPartLabels().sort() :
            // @ts-ignore
            decisionLevel === 2 ? Array.from(getBuildingParts(elementIndex['1']).keys()).sort() :
                // @ts-ignore
                decisionLevel === 3 ? Array.from(getLayersForBuildingPart(elementIndex['1']).keys()).sort():
                        []
    }

    const getData = () => {
        // Element types without area greater
        // than 0 or no layer set are not shown
        return decisionLevel === 0 ? [getGWPForWholeBuilding()]:
            decisionLevel === 1 ? getGeneralBuildingPartLabels().sort()
                .map((label) => getGWPForGeneralBuildingPart(label)) :
            // @ts-ignore
            decisionLevel === 2 ? Array.from(getBuildingParts(elementIndex['1']).keys()).sort()
                .map(buildingPart => getGWPForBuildingPart(buildingPart)) :
                // @ts-ignore
                decisionLevel === 3 ? Array.from(getLayersForBuildingPart(elementIndex['1']).entries()).sort()
                    .map((entry) => getGWPForLayer(entry[0], entry[1])) :
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

    const data = {
        labels: getLabels(),
        datasets: [
            {
                data: getData(),
                backgroundColor: getBarFillColor(getData()),
            },
        ],
    };

    interface GeneratedLegendProps {
        hasHighestGWP: boolean;
        hasNormalGWP: boolean;
    }
    // also generate custom legend - #E3E3E3 element with highest potential, rest is #FF000080
    const GeneratedLegend = ({hasHighestGWP, hasNormalGWP}: GeneratedLegendProps) => {
        return (
            <>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Stack direction="row" spacing={1}>
                    {hasHighestGWP && <Chip label="Highest GWP" style={{backgroundColor: "#FF000080"}} />}
                    {hasNormalGWP &&<Chip label="GWP" style={{backgroundColor: "#E3E3E3"}} />}
                </Stack>
            </div>
            </>
        )
    }

    const showHighestGWPLabel = () => (new Set(data.datasets[0].backgroundColor)).has("#FF000080")
    const showNormalGWPLabel = () => (new Set(data.datasets[0].backgroundColor)).has("#E3E3E3")

    return (
         <div>
            {decisionLevel !== 0 && <Button onClick={() => handleChartNavigation()}>Back</Button>}
            {data.datasets[0].data.length > 0 ? 
            <div>
                <GeneratedLegend    
                    hasHighestGWP={decisionLevel !== 0 && showHighestGWPLabel()}
                    hasNormalGWP={showNormalGWPLabel()}
                />
                <Bar
                    options={options}
                    data={data}
                    ref={chartRef}
                    onClick={(event) => {
                        onClick(event, handleElementIndex)
                    }}
                />
            </div> : <p>Level of Development contains no layer information</p>}
        </div>);
}

export default GWPEvaluation