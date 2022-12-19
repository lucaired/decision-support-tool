from py2neo import Graph, Node, Relationship, Subgraph
from py2neo.matching import *
import ifcopenshell
import json
import sys
import time
import logging

class Graph4Ifc:  
    def __init__(self):
        self.subgraph = None
        self.ifcmodel = None
    
    def add_by_type(self, instances_of_a_type = []):
        for instance in instances_of_a_type:
            self.add(instance)
    
    def add(self, instance):
        info = instance.get_info(recursive=True, ignore=("GlobalId", "OwnerHistory"))
        
        _id = None
        _type = None
        pairs = []
        
        pairs.append(("ifcmodel", self.ifcmodel))

        ## Store the info into _id, _type and pairs
        for key, val in info.items():
            if key == "id":
                _id = val
                continue
            elif key == "type":
                _type = val
                continue
        
        
            if key == "ObjectPlacement" and val["type"] == "IfcLocalPlacement":

                ## For current node's RelativePlacement attribute
                if val["RelativePlacement"]:
                    if val["RelativePlacement"]["Location"] and val["RelativePlacement"]["Location"]["Coordinates"]:
                        pairs.append(("Location", val["RelativePlacement"]["Location"]["Coordinates"]))
                    
                    if val["RelativePlacement"]["Axis"] and val["RelativePlacement"]["Axis"]["DirectionRatios"]:
                        pairs.append(("Axis", val["RelativePlacement"]["Axis"]["DirectionRatios"]))
                    
                    if val["RelativePlacement"]["RefDirection"] and val["RelativePlacement"]["RefDirection"]["DirectionRatios"]:
                        pairs.append(("RefDirection", val["RelativePlacement"]["RefDirection"]["DirectionRatios"]))
                    
                    
                ## For current node's PlacementRelTo attribute
                tmp_val = val["PlacementRelTo"]
                chain = []
                
                while(tmp_val):
                    chain.append(tmp_val["id"])
                    
                    if tmp_val["PlacementRelTo"]:
                        tmp_val = tmp_val["PlacementRelTo"]
                    else:
                        break
                
                pairs.append(("PlacementRelTo_Parents", chain))
                
                ## For the RelativePlacement of final parent node that current node references to
                if val["PlacementRelTo"] and tmp_val["RelativePlacement"]:
                    if tmp_val["RelativePlacement"]: ## add if case to make sure the key of dictionary exists
                        if tmp_val["RelativePlacement"]["Location"] and tmp_val["RelativePlacement"]["Location"]["Coordinates"]:
                            pairs.append(("PlacementRelTo_Location", tmp_val["RelativePlacement"]["Location"]["Coordinates"]))
                        
                        if tmp_val["RelativePlacement"]["Axis"] and tmp_val["RelativePlacement"]["Axis"]["DirectionRatios"]:
                            pairs.append(("PlacementRelTo_Axis", tmp_val["RelativePlacement"]["Axis"]["DirectionRatios"]))
                        
                        if tmp_val["RelativePlacement"]["RefDirection"] and tmp_val["RelativePlacement"]["RefDirection"]["DirectionRatios"]:
                            pairs.append(("PlacementRelTo_RefDirection", tmp_val["RelativePlacement"]["RefDirection"]["DirectionRatios"]))

                    
            if any(hasattr(val, "is_a") and val.is_a(thisTyp)
                   for thisTyp in ["IfcBoolean", "IfcLabel", "IfcText", "IfcReal"]):
                val = val.wrappedValue

                
            if val and type(val) is tuple and type(val[0]) in (str, bool, float, int):
                val = ",".join(str(x) for x in val)

                
            if type(val) not in (str, bool, float, int, type(None)): ## TODO: class NoneType
                continue

            pairs.append((key, val))

        ## Add node to the subgraph only when it is not exist before and both _id and _type exist
        if _id and _type:

            if self.subgraph is not None and [x for x in list(self.subgraph.nodes) if x["nid"] == _id]:
                return
            else: 
                _node = Node(_type, nid=_id)
                for key, val in pairs:
                    _node[key] = val

                self.subgraph = self.subgraph | _node if self.subgraph is not None else _node

    def update_node_properties(self, node, properties={}):
        for key, value in properties.items():
            node[key] = value
                
    def add_relationship(self, source_node, target_node, relationship="has", rel_properties=[]):
        if source_node and target_node: ## Ensure both are not NoneType
            _edge = Relationship(source_node, relationship, target_node)
            for key, val in rel_properties:
                    _edge[key] = val
            
            self.subgraph = self.subgraph | _edge if self.subgraph is not None else _edge
        
    def remove_relationship(self, source_node, target_node, relationship, rel_properties={}):
        if source_node and target_node: ## Ensure both are not NoneType
            _edge = Relationship(source_node, relationship, target_node) ## Relationship equality is based on equality of the start node, the end node and the relationship type.
            for key, val in rel_properties.items():
                    _edge[key] = val
                    
            self.subgraph = self.subgraph - _edge
    
    def remove_node(self, node):
        if node and self.subgraph is not None:
            self.subgraph = self.subgraph - node
        
    def load_to_neo4j(self, conn):
        start = time.time()
        
        ## Exit the program if there is no node in the file
        if self.subgraph is None:
            logging.info("No nodes in file", file=sys.stderr)
            sys.exit(1)
        
        ## Start create graph in neo4j
        logging.info("Start loading subgraph into Neo4j DB...")
        
        conn.create(self.subgraph)
        
        logging.info("Completed at {}, total time taken {} sec".format(
            time.strftime("%Y/%m/%d %H:%M:%S", time.strptime(time.ctime())),
            round(time.time() - start, 2)))
        
def run(path: str, model_name: str):
    def get_id_type_pairs(x):
        _ids = []
        if hasattr(x, "id") and hasattr(x, "is_a"):
            _ids = [(x.id(), x.is_a())]
        elif type(x) is tuple:
            _ids = [(i.id(), i.is_a()) for i in x]
        ## TODO: if not the above cases, return [] or try to throw exception?        
        return _ids 

    def get_ifc_material_content(dictionary):
        try:
            if dictionary["type"] == "IfcMaterial":
                name = dictionary["Name"]
                properties = {"Description": dictionary["Description"],
                              "Category": dictionary["Category"]}
                return name, properties
        except:
            logging.info("TODO: Material (#{}) cannot be added.".format(dictionary["id"]))

    ## Start        
    f = open_ifc_file(path)
    if f is None:
        return
    else:
        logging.info("--Start--")

    
    ## Create graph object for current ifc file    
    _ifcgraph = Graph4Ifc()
    _ifcgraph.ifcmodel = model_name

    #### Start creating the graph content####

    ## TO CREATE ALL DESIRED NODES 
    start = time.time()

    return

    IFC_ESSENTIAL_STRUCTURE_ENTITIES = ["IfcSite", "IfcBuilding", "IfcBuildingStorey", "IfcSpace"]
    ## IFC4 all building elements: 
    ## https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcbuildingelement.htm
    IFC_BUILDING_ELEMENTS = ["IfcBeam", "IfcBuildingElementProxy", "IfcChimney", "IfcColumn", "IfcCovering", "IfcCurtainWall", "IfcDoor", "IfcFooting",
                            "IfcMember", "IfcPile", "IfcPlate", "IfcRailing", "IfcRamp", "IfcRampFlight", "IfcRoof", 
                            "IfcShadingDevice", "IfcSlab", "IfcStair", "IfcStairFlight", "IfcWall", "IfcWindow"]
    IFC_BUILDING_ELEMENTS_ADDITIONAL = ["IfcWallStandardCase"]
    # IFC_FEATURE_ELEMENTS = ["IfcProjectionElement", "IfcSurfaceFeature", "IfcOpeningElement", "IfcVoidingFeature"]
    IFC_FEATURE_ELEMENTS = ["IfcOpeningElement"]
    IFC_VIRTUAL_ELEMENTS = ["IfcVirtualElement"]
    ALL_ELEMENTS = IFC_ESSENTIAL_STRUCTURE_ENTITIES + IFC_BUILDING_ELEMENTS + IFC_BUILDING_ELEMENTS_ADDITIONAL + IFC_FEATURE_ELEMENTS + IFC_VIRTUAL_ELEMENTS

    for element in ALL_ELEMENTS:
        try:
            _ifcgraph.add_by_type(f.by_type(element))
        except:
            logging.info("ALERT: Nodes with label {} cannot added.".format(element))


    logging.info("Prepared {} nodes in {} sec".format(len(_ifcgraph.subgraph.nodes), round(time.time() - start, 2)))

    ##  TO CREATE MATERIAL RELATED PROPERTIES
    start = time.time()
    material_record_count = 0
    
    objects = f.by_type("IfcRelAssociatesMaterial")

    for obj in objects:
        info = zip(obj.get_info(recursive=False, ignore=("GlobalId", "OwnerHistory")).items(),
                   obj.get_info(recursive=True, ignore=("GlobalId", "OwnerHistory")).items())
        
        materials = {}
        for (key, value), (_, details) in info:
            #####################
            # Example of related objects which is stored as tuple for list of related building elements
            # 
            # "RelatedObjects": (
            #                   #17468=IfcDoor('1Oms875aH3Wg$9l65H2ZGw',#12,'Innentuer-1',$,$,#17302,#17464,'E605AACB-6C4E-458D-93-46-5D9D8C7C21D3',2.01,0.885,$,$,$),
            #                   #19199=IfcDoor('0pGAjlJMP3ifYPATVF5xAR',#12,'Innentuer-2',$,$,#19029,#19195,'CBFAA406-7368-4C3F-96-65-F3ED0FC60C2F',2.01,0.885,$,$,$)
            #                   )
            ########################
            # Example of relating materials which can be in several versions
            # 
            # 1. IfcMaterial: 
            #         'RelatingMaterial': {'id': 14521,
            #              'type': 'IfcMaterial',
            #              'Name': 'Holz',
            #              'Description': None,
            #              'Category': None}}
            # -------
            # 2. IfcMaterialList: 
            #        'RelatingMaterial': {'id': 17475,
            #              'type': 'IfcMaterialList',
            #              'Materials': ({'id': 14521,
            #                'type': 'IfcMaterial',
            #                'Name': 'Holz',
            #                'Description': None,
            #                'Category': None},)}}
            # -------
            # 3. IfcMaterialLayerSetUsage:
            #         'RelatingMaterial': {'id': 18469,
            #               'type': 'IfcMaterialLayerSetUsage',
            #               'ForLayerSet': {'id': 15069,
            #                'type': 'IfcMaterialLayerSet',
            #                'MaterialLayers': ({'id': 15067,
            #                  'type': 'IfcMaterialLayer',
            #                  'Material': {'id': 15046,
            #                   'type': 'IfcMaterial',
            #                   'Name': 'Leichtbeton 102890359',
            #                   'Description': None,
            #                   'Category': None},
            #                  'LayerThickness': 0.24,
            #                  'IsVentilated': False,
            #                  'Name': None,
            #                  'Description': None,
            #                  'Category': None,
            #                  'Priority': None},),
            #                'LayerSetName': 'Leichtbeton 102890359 0.24',
            #                'Description': None},
            #               'LayerSetDirection': 'AXIS2',
            #               'DirectionSense': 'POSITIVE',
            #               'OffsetFromReferenceLine': -0.0,
            #               'ReferenceExtent': None}}
            #######################
            try:
                if key == "RelatedObjects":
                    nodes = get_id_type_pairs(value)


                elif key == "RelatingMaterial":
                    if details["type"] == "IfcMaterial":
                        routing = {"nid_route": [details["id"]]}

                        name, properties = get_ifc_material_content(details)
                        if name in materials.keys():
                            logging.info("TODO: Non-unique name {} exists for IfcMaterial".format(name))
                        else:
                            materials[name] = {**properties, **routing}


                    elif details["type"] == "IfcMaterialList":
                        routing = {"nid_route": [details["id"]]}

                        for item in details["Materials"]:
                            routing["nid_route"].append(item["id"])

                            name, properties = get_ifc_material_content(item)
                            if name in materials.keys():
                                logging.info("TODO: Non-unique name {} exists for IfcMaterialList (#{})".format(name, details["id"]))
                            else:
                                materials[name] = {**properties, **routing}


                    elif details["type"] == "IfcMaterialLayerSetUsage": # https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcmaterialresource/lexical/ifcmateriallayersetusage.htm
                        routing = {"nid_route": [details["id"], details["ForLayerSet"]["id"]]}

                        layerset_properties = {
                            "LayerSetDirection": details["LayerSetDirection"],
                            "DirectionSense": details["DirectionSense"], 
                            "OffsetFromReferenceLine": details["OffsetFromReferenceLine"],
                            "ReferenceExtent": details["ReferenceExtent"],
                            "LayerSetName": details["ForLayerSet"]["LayerSetName"],
                            "LayerSet_Description": details["ForLayerSet"]["Description"],
                        }

                        for layer in details["ForLayerSet"]["MaterialLayers"]: ## IfcMaterialLayerSet -> IfcMaterialLayer
                            routing["nid_route"].append(layer["id"])
                            routing["nid_route"].append(layer["Material"]["id"])

                            layer_properties = {
                                "LayerThickness": layer["LayerThickness"],
                                "IsVentilated": layer["IsVentilated"],
                                "Priority": layer["Priority"],
                                "Layer_Name": layer["Name"],
                                "Layer_Description": layer["Description"],
                                "Layer_Category": layer["Category"],
                            }

                            name, properties = get_ifc_material_content(layer["Material"])
                            if name in materials.keys():
                                logging.info("TODO: Non-unique name {} exists for IfcMaterialList (#{})".format(name, details["id"]))
                            else:
                                materials[name] = {**properties, **layer_properties, **layerset_properties, **routing}

                    else:
                        logging.info("TODO: {} is not handled.".format(details["type"]))

            except Exception as e:
                logging.info("TODO: {} for {}".format(type(e), e))
                continue

        
        if nodes and materials:
            for node in nodes:
                nid = node[0]
                target = [x for x in list(_ifcgraph.subgraph.nodes) if x["nid"] == nid]
                
                if target:
                    target = target[0]
                
                    _ifcgraph.update_node_properties(target, properties={"materials": json.dumps(materials)})
                    material_record_count += 1
        
        if debug:
            logging.info("parents", nodes)
            logging.info("materials", materials)
    
    logging.info("Prepared {} material records in {} sec".format(material_record_count, round(time.time() - start, 2)))

    

    ## TO CREATE EDGES BETWEEN PARENT AND SIBLING NODES
    #####################################################################################################
    # Example for IfcRelAggregates
    # 
    # #481=IfcRelAggregates('1Y0uyqfGvXQyvJl5QblObD',#12,$,$,#434,(#479,#35065))
    #
    # #434 is the RelatingObject
    # (#479,#35065) are the RelatedObjects
    # 
    # Now to create edges between node with nid = #434 to nodes with nid as #479 and #35065 respectively
    #####################################################################################################
    start = time.time()

    ## IFC entity types indicating relationships of nodes
    RELATIONSHIP_ENTITIES = ["IfcRelAggregates", "IfcRelSpaceBoundary", 
                             "IfcRelFillsElement", "IfcRelVoidsElement", ## Attribute type for IfcElement https://bit.ly/3nrW1N5
                             "IfcRelContainedInSpatialStructure", "IfcRelConnectsPathElements"]  

    for entity in RELATIONSHIP_ENTITIES: 
        objects = f.by_type(entity) ## Get all related IFC objects with the type

        for obj in objects: ## Get list of parent nodes and their corresponding sibling nodes
            info = obj.get_info(recursive=False, ignore=("GlobalId", "OwnerHistory", "Name", "Description"))

            rel_properties = []
            for key, value in info.items():
                if ("Relating" in key and entity != "IfcRelConnectsPathElements") or (entity == "IfcRelConnectsPathElements" and key == "RelatingElement"):
                # if key == "RelatingObject": ## For IfcRelAggregates   # https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifckernel/lexical/ifcrelaggregates.htm
                # if key == "RelatingSpace": ## For IfcRelSpaceBoundary # https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/ifcproductextension/lexical/ifcrelspaceboundary.htm
                # if key == "RelatingOpeningElement": ## For IfcRelFillsElement # https://standards.buildingsmart.org/IFC/DEV/IFC4_2/FINAL/HTML/schema/ifcproductextension/lexical/ifcrelfillselement.htm
                # if key == "RelatingElement": ## For IfcRelConnectsPathElements
                    parents = get_id_type_pairs(value)
                elif ("Related" in key and entity != "IfcRelConnectsPathElements") or (entity == "IfcRelConnectsPathElements" and key == "RelatedElement"):
                # elif key == "RelatedObjects": ## For IfcRelAggregates
                # elif key == "RelatedBuildingElement": ## For IfcRelSpaceBoundary
                # elif key == "RelatedBuildingElement": ## For IfcRelFillsElement
                # elif key == "RelatedElement": ## For IfcRelConnectsPathElements
                    siblings = get_id_type_pairs(value)
                else:
                    if key == "id":
                        rel_properties.append(("nid_route", [value]))
                    elif key == "type":
                        rel_properties.append(("relationship_route", [value]))
                    elif hasattr(value, "id") and hasattr(value, "is_a"): ## If value is of type <class 'ifcopenshell.entity_instance.entity_instance'> 
                        rel_properties.append((key, str(value.id()) + "_" + str(value.is_a())))
                    else:
                        rel_properties.append((key, value))

            if parents and siblings: ## Ensure both are not empty lists
                for parent in parents:
                    pid = parent[0]
                    source = [x for x in list(_ifcgraph.subgraph.nodes) if x["nid"] == pid]

                    if source:
                        source = source[0]

                        for sibling in siblings:
                            sid = sibling[0]

                            target = [x for x in list(_ifcgraph.subgraph.nodes) if x["nid"] == sid]

                            if target:
                                target = target[0]
                                # _ifcgraph.add_relationship(source, target, relationship=entity, rel_properties=rel_properties)
                                if entity == "IfcRelConnectsPathElements":
                                    _ifcgraph.add_relationship(source, target, relationship="isNextTo", rel_properties=rel_properties)
                                    _ifcgraph.add_relationship(target, source, relationship="isNextTo", rel_properties=[("ref_nid_route", info["id"])])
                                else:
                                    _ifcgraph.add_relationship(source, target, relationship="has", rel_properties=rel_properties)

    logging.info("Prepared {} relationships in {} sec".format(len(_ifcgraph.subgraph.relationships), round(time.time() - start, 2)))    


    ## TO RETRIEVE CORRESPONDING PROPERTIES OF ALL ELEMENTS (i.e. NODES)
    ## TODO: Consider the units of the properties with IFCxxxUNIT
    start = time.time()

    # ALL_ELEMENTS = IFC_ESSENTIAL_STRUCTURE_ENTITIES + IFC_BUILDING_ELEMENTS + IFC_FEATURE_ELEMENTS + IFC_VIRTUAL_ELEMENTS
    nids = [x["nid"] for x in list(_ifcgraph.subgraph.nodes) if str(x.labels).replace(":Ifc", "Ifc") in ALL_ELEMENTS]

    ifcreldefinesbyproperties = f.by_type("IfcRelDefinesByProperties") ## N-to-N relationship

    prop_count = 0
    for prop in ifcreldefinesbyproperties:
        info = prop.get_info(recursive=True, ignore=("GlobalId", "OwnerHistory"))

        if info["RelatedObjects"] and info["RelatingPropertyDefinition"]:

            ## There maybe multiple realted objects
            ## Only consider the properties pointing to exsiting nodes
            relatedobjectsids = [x["id"] for x in info["RelatedObjects"] if x["id"] in nids] 
            if relatedobjectsids:

                relatednodes = [x for x in list(_ifcgraph.subgraph.nodes) if x["nid"] in relatedobjectsids]

                ##########################################################################################################################################
                ## IfcPropertySetDefinition hierarchy (https://bit.ly/3eTuksv): 
                ## IfcPropertySetDefinition ->
                ##   [Case 1] IfcPropertySet
                ##   [Case 2] IfcQuantitySet -> IfcElementQuantity
                ##   [Case 3] IfcPreDefinedPropertySet -> {IfcDoorLiningProperties, IfcDoorPanelProperties, IfcPermeableCoveringProperties, 
                ##                                         IfcReinforcementDefinitionProperties, IfcWindowLiningProperties, IfcWindowPanelProperties}
                ##########################################################################################################################################

                ## Case 1:
                ## For properties in the type of IfcPropertySet (with attr HasProperties) 
                ## https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/templates/property-sets-for-objects.htm
                ## TODO: consider the list of NominalValue type, including IfcMeasureValue (https://bit.ly/3eQWqVh) and IfcDerivedMeasureValue (https://bit.ly/2Sp1hWm)
                ##       example: 'NominalValue': {'id': 0, 'type': 'IfcAreaMeasure', 'wrappedValue': 0.0}
                if info["RelatingPropertyDefinition"]["type"] == "IfcPropertySet":

                    for node in relatednodes:
                        for p in info["RelatingPropertyDefinition"]["HasProperties"]:
                            
                            try:
                                key = p["Name"] # key = "__" + info["RelatingPropertyDefinition"]["Name"] + "__" + p["type"] + "__" + p["Name"]

                                if p["type"] == "IfcPropertySingleValue": # Related Info: NominalValue -> {type, wrappedValue} & Unit
                                    value = p["NominalValue"]["wrappedValue"]
                                    node[key] = value
                                    prop_count += 1
                                else:
                                    logging.info("#TODO: Node {} falls into the case of {}".format(node["nid"], p["type"]))
                                    ## TODO: check and enhance the follow cases if there are real case examples
                                    ##########################################################################################################################
                                    ## Useful info for:
                                    ##   IfcPropertyBoundedValue: UpperBoundValue & LowerBoundValue & Unit & SetPointValue
                                    ##   IfcPropertyEnumeratedValue: EnumerationValues & EnumerationReference
                                    ##   IfcPropertyListValue: ListValues & Unit
                                    ##   IfcPropertyTableValue: DefiningValues & DefinedValues & Expression & DefiningUnit & DefinedUnit & CurveInterpolation
                                    ##########################################################################################################################
                            except:
                                logging.info("Property type {} cannot be added for node (nid: {})".format(p["type"], node["nid"]))


                ## Case 2:
                ## For properties in the type of IfcElementQuantity (with attr Quantities) (https://bit.ly/3vJkEYj)
                ## https://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/schema/templates/quantity-sets.htm
                elif info["RelatingPropertyDefinition"]["type"] == "IfcElementQuantity":

                    for node in relatednodes: 
                        for q in info["RelatingPropertyDefinition"]["Quantities"]:
                                                                   
                            try:
                                if q["type"] == "IfcPhysicalComplexQuantity":
                                    sub_qs = q["HasQuantities"]

                                    for sub_q in sub_qs:
                                        key = sub_q["Name"]

                                        subkey = sub_q["type"].replace("IfcQuantity", "") + "Value" ## e.g to get "LengthValue" from "IfcQuantityLength"
                                        value = sub_q[subkey]

                                        node[key] = value
                                        prop_count += 1
                                else:
                                    key = q["Name"] # key = "__" + info["RelatingPropertyDefinition"]["Name"] + "__" + q["type"] + "__" + q["Name"]

                                    subkey = q["type"].replace("IfcQuantity", "") + "Value" ## e.g to get "LengthValue" from "IfcQuantityLength"
                                    value = q[subkey]

                                    node[key] = value
                                    prop_count += 1
                                    ##########################################################################################################################
                                    ## Except the value, e.g. "LengthValue", additional useful info for them include: Unit & Formula
                                    ##########################################################################################################################
                            except:
                                logging.info("Property type {} cannot be added for node (nid: {})".format(q["type"], node["nid"]))


                ## Case 3:
                ## TODO when other subtypes of IfcPropertySetDefinition if required.  
                else:
                    continue

    logging.info("Prepared total {} node properties in {} sec".format(prop_count, round(time.time() - start, 2)))    

    
    ## TO SIMPLIFY (:IfcWallStandardCase)-[:has]->(:IfcOpeningElement)-[:has]->() to (:IfcWallStandardCase)-[:has]->()
    start = time.time()
    
    sources = [(r.end_node["nid"], r.start_node["nid"], r.end_node, r.start_node, type(r).__name__, dict(r)) for r in list(_ifcgraph.subgraph.relationships) 
               if r.start_node.has_label("IfcWallStandardCase") and r.end_node.has_label("IfcOpeningElement")]   
    destinations = [(r.start_node["nid"], r.end_node["nid"], r.start_node, r.end_node, type(r).__name__, dict(r)) for r in list(_ifcgraph.subgraph.relationships) 
                    if r.start_node.has_label("IfcOpeningElement") and (r.end_node.has_label("IfcWindow") or r.end_node.has_label("IfcDoor"))]
    
    for s in sources:
        for d in destinations:
            if s[0] == d[0]: ## check if same nid for same IfcOpeningElement node
                discard_node = s[2]
                start_node = s[3]
                end_node = d[3]

                new_rel_properties = [
                    ("nid_route", s[5]["nid_route"] + [discard_node["nid"]] + d[5]["nid_route"]),
                    ("relationship_route", s[5]["relationship_route"] + [list(discard_node.labels)[0].replace(":", "")] + d[5]["relationship_route"]),
                ]

                _ifcgraph.add_relationship(start_node, end_node, relationship="has", rel_properties=new_rel_properties)
                _ifcgraph.remove_relationship(start_node, discard_node, relationship=s[4], rel_properties=s[5])
                _ifcgraph.remove_relationship(discard_node, end_node, relationship=d[4], rel_properties=d[5])
                _ifcgraph.remove_node(discard_node)
    
    logging.info("Simplified paths with IfcOpeningElement in {} sec".format(round(time.time() - start, 2)))    

    
    ## TO SIMPLIFY (:IfcSpace)-[:has]->(:IfcVirtualElement)<-[:has]-(:IfcSpace) to (:IfcSpace)<-[:connect]->(:IfcSpace)
    start = time.time()
    
    spaces = [(r.end_node["nid"], r.start_node["nid"], r.end_node, r.start_node, type(r).__name__, dict(r)) for r in list(_ifcgraph.subgraph.relationships) 
               if r.start_node.has_label("IfcSpace") and r.end_node.has_label("IfcVirtualElement")]   
    
    for s1 in spaces:
        for s2 in spaces:
            if s1[0] == s2[0] and s1[1] != s2[1]: ## wants same IfcVirtualElement node but different IfcSpace nodes
                discard_node = s1[2]
                s1_node = s1[3]
                s2_node = s2[3]

                new_rel_properties = [
                    ("nid_route", s1[5]["nid_route"] + [discard_node["nid"]] + s2[5]["nid_route"]),
                    ("relationship_route", s1[5]["relationship_route"] + [list(discard_node.labels)[0].replace(":", "")] + s2[5]["relationship_route"]),
                ]

                _ifcgraph.add_relationship(s1_node, s2_node, relationship="connectsWithVirtualBoundary", rel_properties=new_rel_properties)
                _ifcgraph.add_relationship(s2_node, s1_node, relationship="connectsWithVirtualBoundary", rel_properties=new_rel_properties)
                _ifcgraph.remove_relationship(s1_node, discard_node, relationship=s1[4], rel_properties=s1[5])
                _ifcgraph.remove_relationship(s2_node, discard_node, relationship=s2[4], rel_properties=s2[5])
                _ifcgraph.remove_node(discard_node)
    
    logging.info("Simplified paths with IfcVirtualElement in {} sec".format(round(time.time() - start, 2)))    

    
    ## TO REPLACE NAMES OF LABELS TO SIMPLER ONES
    IFC_RENAMING_DICT = {"IfcSite": "Site", "IfcBuilding": "Building", "IfcBuildingStorey": "Storey", "IfcSpace": "Space",
                         "IfcBeam": "Beam", "IfcBuildingElementProxy": "Proxy", "IfcChimney": "Chimney", "IfcColumn": "Column",
                         "IfcCovering": "Covering", "IfcCurtainWall": "Curtain_Wall", "IfcDoor": "Door", "IfcFooting": "Footing",
                         "IfcMember": "Member", "IfcPile": "Pile", "IfcPlate": "Plate", "IfcRailing": "Railing", "IfcRamp": "Ramp", 
                         "IfcRampFlight": "Ramp_Flight", "IfcRoof": "Roof", "IfcShadingDevice": "Shading_Device", "IfcSlab": "Slab",
                         "IfcStair": "Stair", "IfcStairFlight": "Stair_Flight", "IfcWallStandardCase": "Wall", "IfcWall": "Wall", 
                         "IfcWindow": "Window",
                         "IfcOpeningElement": "Opening", "IfcVirtualElement": "Virtual_Boundary"}
    for x in list(_ifcgraph.subgraph.nodes):
        l = str(x.labels).replace(":Ifc", "Ifc")
        x.remove_label(l)
        x.add_label(IFC_RENAMING_DICT[l])
        
    
    if debug:
        logging.info("Subgraph:")
        display(_ifcgraph.subgraph)
    #### Finish creating the graph content ####
    
    #conn = get_connection()
    #_ifcgraph.load_to_neo4j(conn)
    logging.info("--End--")

def check_using_default(item, default_value, msg = "Default value is applied."):
    if item == "":
        item = default_value
        logging.info(msg)

    return item
    
def open_ifc_file(ifc_path: str):
    while (True):

        try:
            with open(ifc_path) as infile:
                for line in infile:
                    if line.startswith("FILE_SCHEMA"):
                        schema = line[14:-5]
                        logging.info("Ifc schema, {}, is going to be processed.".format(schema))
                        
                        if schema != "IFC4":
                            to_continue = input("This program does not fully support {} schema, do you want to continue? (y/n)".format(schema))
                            if to_continue.lower() == "n":
                                logging.info("--End--")
                                return
                        break
                     
            f = ifcopenshell.open(ifc_path)

            return f
        except:
            logging.info("No Ifc Found, Please write the path to the IFC File")

# Connect to desired Neo4j database                
def get_connection(default_uri = "localhost:7687", default_username = "neo4j", default_password = "123"):
    while (True):         
        uri = input("Please input desired Neo4j URI (default: {}): ".format(default_uri))
        uri = check_using_default(uri, default_uri, "URI invalid. Default value is applied.")
        
        username = input("Please input username (default: {}): ".format(default_username))
        username = check_using_default(username, default_username, "Username invalid. Default value is applied.")

        password = getpass("Please input password (default: {}): ".format(default_password))
        password = check_using_default(password, default_password, "Password invalid. Default value is applied.")

        try:
            logging.info(uri, username, password)
            conn = Graph(auth=(username, password), address=uri) 
            logging.info("Connection Successfull.")
            return conn
        except:
            logging.info("Auth error, please try again.")
            ifc_path = ""
            username = ""
            uri = ""
