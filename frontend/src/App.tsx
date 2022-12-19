import * as React from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import ButtonAppBar from './components/Wrapper/AppBar'
import { DecisionTree } from './components/Tree/NodeHandler';
import VariantViewer from './components/Variant/VariantViewer';
import AppDrawer from './components/Wrapper/AppDrawer';

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
        axios.post(`http://localhost:80/projects/`, project)
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
        axios.put(`http://localhost:80/projects/${project._id}`, updateSet)
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
        axios.delete(`http://localhost:80/projects/${projectId}`)
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
    const toggleDrawer =
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

    const queryProjects = () => axios.get(`http://localhost:80/projects/`)
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
            <AppDrawer 
                drawerState={leftDrawerState} 
                toggleDrawer={toggleDrawer}
                allProjects={allProjects}
                activeProjectHandler={activeProjectHandler}
                removeProjectHandler={removeProjectHandler}
                saveProjectHandler={saveProjectHandler}
            />
            <ButtonAppBar 
                activeVariant={activeVariant}
                activeProject={activeProject}
                toggleDrawer={toggleDrawer}
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
