import {useReadCypher} from "use-neo4j";

// @ts-ignore
function Evaluation({neo4JReference}) {

    // use essential building elements for BoQ
    const q = 'MATCH (b:Building {ifcmodel: $ifcmodel})-[:has]->(:Storey)-[:has]->(element)' +
        'WHERE (not (element:Space or element:Door or element:Window))'+
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
        <h3>Building GWP using Bill of Quantities</h3>
        <p>Total number of building parts<strong>: </strong>{records?.length || 0}</p>
        <p>Total surface<strong>: </strong>{totalAreaRounded} m<span>&#178;</span> </p>
        <h4>Global warming potential range</h4>
        <p><strong>Wood:</strong> {totalAreaRounded * 15} - {totalAreaRounded * 35}</p>
        <p><strong>Bricks:</strong> {totalAreaRounded * 25} - {totalAreaRounded * 40}</p>
        <p><strong>Reinforced Concrete:</strong> {totalAreaRounded * 30} - {totalAreaRounded * 60}</p>
    </div>
}

export default Evaluation