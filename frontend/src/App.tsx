import * as React from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import ButtonAppBar from './components/Wrapper/AppBar'
import { DecisionTree } from './components/Tree/NodeHandler';
import VariantViewer from './components/Variant/VariantViewer';
import ProjectsDrawer from './components/Wrapper/ProjectsDrawer';
import SimilarProjectsDrawer from './components/Wrapper/SimilarProjectsDrawer';
import { DesignEpisodeMatchingModal } from './components/Wrapper/DesignEpisodeMatchingModal';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost'

function App() {

    const [allProjects, setAllProjects] = React.useState<any>([]);
    const [allSimilarProjects, setAllSimilarProjects] = React.useState<any>([]);

    const [activeProject, setActiveProject] = React.useState<any>();
    const activeProjectHandler = (project: any) => {
        setActiveProject(project)
        setActiveVariant(project.tree)
    }
    const activeProjectTreeHandler = (projectTree: DecisionTree) => {
        let project = {...activeProject, tree: projectTree};
        // update also all projects here
        setActiveProject(project);
    }

    const saveProjectHandler = (project: object) => {
        const parsedTree = {
            // @ts-ignore
            ...project.tree,
            // @ts-ignore
            'designEpisodeIds': project.tree.designEpisodeIds.split(',')
        }
        // @ts-ignore
        project.tree = parsedTree
        axios.post(`http://${backendUrl}:80/projects/`, project)
        // @ts-ignore
        .then(function (response) {
        // @ts-ignore
            if (response.data) {
                let project = response.data
                const parsedTree = {
                    // @ts-ignore
                    ...project.tree,
                    // @ts-ignore
                    'designEpisodeIds': project.tree.designEpisodeIds.join(',')
                }
                // @ts-ignore
                project.tree = parsedTree
                activeProjectHandler(response.data)
            }
        })
        // @ts-ignore
        .catch((error) => console.log(error))
    }
    
    // @ts-ignore
    const updateProjectHandler = (project) => {
        const updateSet = {...project}
        delete updateSet['_id']
        // @ts-ignore
        updateSet.tree = parseOutgoingTree(updateSet.tree)
        axios.put(`http://${backendUrl}:80/projects/${project._id}`, updateSet)
        // @ts-ignore
        .then(function (response) {
        // @ts-ignore
            if (response.data) {
                let project = response.data
                // @ts-ignore
                project.tree = parseIncomingTree(project.tree)
                activeProjectHandler(response.data)
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
            // TODO: set to some other project
        })
        // @ts-ignore
        .catch((error) => console.log(error))
    }

    const queryProjects = () => axios.get(`http://${backendUrl}:80/projects/`)
    // @ts-ignore
    .then(function (response) {

        // @ts-ignore
        const projects = response.data.map((project) => {
            // @ts-ignore
            project.tree = parseIncomingTree(project.tree)
            return project
        })

        setAllProjects(projects);

        if (response.data.length > 0) {
            if (!activeProject) {
                setActiveProject(projects[0]);
                setActiveVariant(projects[0].tree);
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

    const queryMatchingProjects = (variantsToDesignEpisodes: Object) => {
        const projectId = activeProject._id
        return axios.post(`http://${backendUrl}:80/matchings/project/${projectId}/match_by_design_episodes`, variantsToDesignEpisodes)
        // @ts-ignore
        .then(function (response) {

            // @ts-ignore
            const projects = response.data.map((project) => {
                // @ts-ignore
                project.tree = parseIncomingTree(project.tree)
                return project
            })

            setAllSimilarProjects(projects)
        })
        // @ts-ignore
        .catch((error) => console.log(error));
    }

     // @ts-ignore
    const parseIncomingTree = (tree) => {
        const parsedTree = {
            ...tree,
            // @ts-ignore
            'designEpisodeIds': tree.designEpisodeIds.join(','),
            // @ts-ignore
            'children': tree.children.map((child) => parseIncomingTree(child))
        }
        return parsedTree
    }

    // @ts-ignore
    const parseOutgoingTree = (tree) => {
        const parsedTree = {
            // @ts-ignore
            ...tree,
            // @ts-ignore
            'designEpisodeIds': tree.designEpisodeIds.split(','),
            // @ts-ignore
            'children': tree.children.map((child) => parseOutgoingTree(child))
        }
        return parsedTree
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
        if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
        return;
        }
        setRightDrawerState(open);
    };
    
    const [showDesignEpisodeMatchingModal, setShowDesignEpisodeMatchingModal] = React.useState(false);

    const showDesignEpisodeMatchingModalHandler = (state: boolean) => {
        setShowDesignEpisodeMatchingModal(state)
      }

    useEffect(() => {queryProjects()}, [leftDrawerState]);

    useEffect(() => {
        if (allSimilarProjects.length > 0) {
            setRightDrawerState(true)
        }
    }, [allSimilarProjects]);

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
                allSimilarProjectsByDE={allSimilarProjects}
            />
            <DesignEpisodeMatchingModal 
                showDesignEpisodeMatchingModal={showDesignEpisodeMatchingModal} 
                showDesignEpisodeMatchingModalHandler={showDesignEpisodeMatchingModalHandler} 
                queryMatchingProjects={queryMatchingProjects}
                activeProjectTree={activeProject?.tree}            
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
                showDesignEpisodeMatchingModalHandler={showDesignEpisodeMatchingModalHandler}
                saveCurrentProject={saveCurrentProject}
            />
            {activeProject && <VariantViewer 
                activeProject={activeProject} 
                activeVariant={activeVariant}
                activeVariantHandler={activeVariantHandler}
                activeProjectTreeHandler={activeProjectTreeHandler}
                />}
        </div>
    )
}

export default App;
