import * as React from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import ButtonAppBar from './components/Wrapper/AppBar'
import { DecisionTree } from './components/Tree/NodeHandler';
import VariantViewer from './components/Variant/VariantViewer';
import ProjectsDrawer from './components/Wrapper/ProjectsDrawer';
import SimilarProjectsDrawer from './components/Wrapper/SimilarProjectsDrawer';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost'

function App() {


    const [allProjects, setAllProjects] = React.useState<any>([]);
    const [activeProject, setActiveProject] = React.useState<any>();
    const activeProjectHandler = (project: any) => {
        setActiveProject(project)
        setActiveVariant(project.tree)
    }
    const activeProjectTreeHandler = (projectTree: DecisionTree) => {
        let project = {...activeProject, tree: projectTree};
        setActiveProject(project);
    }

    const saveProjectHandler = (project: object) => {
        axios.post(`http://${backendUrl}:80/projects/`, project)
        // @ts-ignore
        .then(function (response) {
        // @ts-ignore
            if (response.data) {
                setActiveProject(response.data)
            }
        })
        // @ts-ignore
        .catch((error) => console.log(error))
    }
    
    // @ts-ignore
    const updateProjectHandler = (project) => {
        const updateSet = {...project}
        delete updateSet['_id']
        axios.put(`http://${backendUrl}:80/projects/${project._id}`, updateSet)
        // @ts-ignore
        .then(function (response) {
        // @ts-ignore
            if (response.data) {
                setActiveProject(response.data)
            }
        })
        // @ts-ignore
        .catch((error) => console.log(error))
    }

    const saveCurrentProject = () => {
        updateProjectHandler(activeProject)
    }

    const removeProjectHandler = (projectId: string) => {
        axios.delete(`http://${backendUrl}:80/projects/${projectId}`)
        // @ts-ignore
        .then(function (response) {
        })
        // @ts-ignore
        .catch((error) => console.log(error))
    }

    const [activeVariant, setActiveVariant] = React.useState<DecisionTree>();
    const activeVariantHandler = (variant: DecisionTree) => {
        setActiveVariant(variant)
    }

    const [leftDrawerState, setLeftDrawerState] = React.useState(false);
    const toggleLeftDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
        return;
        }
        setLeftDrawerState(open);
    };
    const [rightDrawerState, setRightDrawerState] = React.useState(false);
    const toggleRightDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
        console.log("hi")
        if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
        return;
        }
        setRightDrawerState(open);
    };

    const queryProjects = () => axios.get(`http://${backendUrl}:80/projects/`)
        // @ts-ignore
        .then(function (response) {
            // @ts-ignore
            setAllProjects(response.data);
            if (response.data.length > 0) {
                if (!activeProject) {
                    setActiveProject(response.data[0]);
                    setActiveVariant(response.data[0].tree);
                } else {
                    setActiveProject(activeProject)
                    setActiveVariant(activeProject.tree)
                }
            } else {
                setActiveProject(undefined);
                setActiveVariant(undefined);
            }
        })
        // @ts-ignore
        .catch((error) => console.log(error));

    useEffect(() => {queryProjects()}, [leftDrawerState]);

    return (
        <div 
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
            }}
        >
            <SimilarProjectsDrawer
                drawerState={rightDrawerState} 
                toggleRightDrawer={toggleRightDrawer}
                activeProjectHandler={activeProjectHandler}
                allSimilarProjectsByDE={allProjects}
                allSimilarProjectsByBuildingCode={allProjects}
            />
            <ProjectsDrawer 
                drawerState={leftDrawerState} 
                toggleLeftDrawer={toggleLeftDrawer}
                allProjects={allProjects}
                activeProjectHandler={activeProjectHandler}
                removeProjectHandler={removeProjectHandler}
                saveProjectHandler={saveProjectHandler}
            />
            <ButtonAppBar 
                activeVariant={activeVariant}
                activeProject={activeProject}
                toggleLeftDrawer={toggleLeftDrawer}
                toggleRightDrawer={toggleRightDrawer}
                saveCurrentProject={saveCurrentProject}
            />
            {activeProject && <VariantViewer 
                activeProject={activeProject} 
                activeVariant={activeVariant}
                activeProjectTree={activeProject.tree}
                activeVariantHandler={activeVariantHandler}
                activeProjectTreeHandler={activeProjectTreeHandler}
                />}
        </div>
    )
}

export default App;
