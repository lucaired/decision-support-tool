import {useReadCypher} from "use-neo4j";
import { useRef } from 'react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Bar, getElementAtEvent } from 'react-chartjs-2';
import Button from "@mui/material/Button";
import * as React from "react";
import { faker } from '@faker-js/faker';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// @ts-ignore
function Evaluation({neo4JReference}) {

    const [activeLevel, setActiveLevel] = React.useState('building');
    const activeLevelHandler = (level: string) => setActiveLevel(level);

    const [buildingConfiguration, setBuildingConfiguration] = React.useState({});
    const buildingConfigurationHandler = (key: string, value: string) => {
        setBuildingConfiguration({
            ...buildingConfiguration,
            key: value
        })
    }

    // use essential building elements for BoQ
    const q = 'MATCH (b:Building {ifcmodel: $ifcmodel})-[:has]->(:Storey)-[:has]->(element)' +
        'WHERE (not (element:Space))'+
        'RETURN labels(element), element.TotalSurfaceArea, element.GrossArea, element.GrossSideArea, element.LoadBearing, element.IsExternal'
    const params = {ifcmodel: neo4JReference}
    const { loading, records } = useReadCypher(q, params)

    if ( loading ) return (<div>Loading...</div>)

    let totalArea = 0

    records?.forEach((record) => {
        const totalSurfaceArea = record.get('element.TotalSurfaceArea')
        const grossArea = record.get('element.GrossArea')
        const grossSideArea = record.get('element.GrossSideArea')
        // take only one
        totalArea += totalSurfaceArea ? totalSurfaceArea : grossArea ? grossArea : grossSideArea ? grossSideArea : 0
    })

    const totalAreaRounded = Math.round((totalArea + Number.EPSILON) * 100) / 100


    return <div>
        <VariantExplorerMenu activeLevelHandler={activeLevelHandler}/>
        {
            activeLevel === 'building' ? <WholeBuildingEvaluation totalAreaRounded={totalAreaRounded}/> :
                activeLevel === 'building-part' ? <BuildingPartEvaluation records={records}/> :<p>No Level</p>
        }
    </div>
}

// @ts-ignore
function VariantExplorerMenu({activeLevelHandler}) {
    return <div
        style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            gap: "5px",
        }}>
        <Button style={{background: "green"}} onClick={() => activeLevelHandler('building')} variant="contained">Construction Level</Button>
        <Button style={{background: "green"}} onClick={() => activeLevelHandler('building-part')} variant="contained">Building Part Level</Button>
    </div>;
}

// @ts-ignore
function WholeBuildingEvaluation({totalAreaRounded}) {
    const gwpWood = [5000, totalAreaRounded * 3.5]
    const gwpConcrete = [15000, totalAreaRounded * 6]
    const gwpBricks = [10000, totalAreaRounded * 5]

    const gwpWholeBuilding = [
        Math.min(gwpWood[0], gwpConcrete[0], gwpBricks[0]),
        Math.max(gwpWood[1], gwpConcrete[1], gwpBricks[1])
    ]

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'GWP Construction Types',
            },
        },
    };
    const labels = ['Whole Building Range', 'Brick', 'Reinforced concrete', 'Wood'];
    const data = {
        labels,
        datasets: [
            {
                label: 'GWP in t CO2-eq',
                data: [gwpWholeBuilding, gwpBricks, gwpConcrete, gwpWood]
            },
        ],
    };

    return <Bar options={options} data={data} />;
}

// @ts-ignore
const mapToBuildingPartDecision = (elementsByElementType, index) => {
    const buildingPartType = Array.from(elementsByElementType.keys())[index]
    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: `GWP for ${buildingPartType} type`,
            },
        },
    };

    // TODO: do mapping
    const labels = ["Wood frame 1", "Wood fram 2", "Wood solid 1", "Wood solid 2"]

    const data = {
        labels,
        datasets: [
            {
                label: 'GWP in t CO2-eq',
                data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            },
        ],
    };

    return <Bar
        options={options}
        data={data}
    />
}

// @ts-ignore
function BuildingPartEvaluation({records}) {
    let elementsByElementType = new Map<string, number>();
    const [elementIndex, setElementIndex] = React.useState(-1);
    const handleElementIndex = (index: number) => setElementIndex(index)

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
    })

    const chartRef = useRef();

    // get element index from the dataseries
    const onClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>, handleElementIndex: (index: number) => void) => {
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
                text: 'GWP Building Parts',
            },
        },
    };
    const data = {
        labels: Array.from(elementsByElementType.keys()),
        datasets: [
            {
                label: 'GWP in t CO2-eq',
                data: Array.from(elementsByElementType.values()).map(value => [value * Math.random(), value])
            },
        ],
    };
    // Show all building parts or the evaluation for a specific one
    return (
        <div>
            {elementIndex === -1 ? <Bar
                    options={options}
                    data={data}
                    ref={chartRef}
                    onClick={(event) => onClick(event, handleElementIndex)}
                />
                : mapToBuildingPartDecision(elementsByElementType, elementIndex)
            }
        </div>
    );
}


export default Evaluation