import * as React from 'react';
import { Box, Button, Checkbox, Fade, FormControlLabel, Modal, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { DecisionTree } from '../Tree/NodeHandler';

interface DesignEpisodeMatchingModal {
    showDesignEpisodeMatchingModal: boolean; 
    showDesignEpisodeMatchingModalHandler: (show: boolean)=>void;
    queryProjects: ()=>void;
    activeProjectTree: DecisionTree;
}

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&:before, &:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&:before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&:after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

export function DesignEpisodeMatchingModal({
    showDesignEpisodeMatchingModal, 
    showDesignEpisodeMatchingModalHandler,
    queryProjects,
    activeProjectTree,
}: DesignEpisodeMatchingModal
    ) {
        // local state with variantName -> [DEId1, DEId2, ...]
        //@ts-ignore
        const [variantsToDesignEpisodes, setVariantsToDesignEpisodes] = React.useState<Object>({});
        
        const isDesignEpisodeSetInVariant = (variantName: string, designEpisodeId: string) => {
          if (Object.hasOwn(variantsToDesignEpisodes, variantName)) {
            // @ts-ignore
            return variantsToDesignEpisodes[variantName].some(designEpisodeId => designEpisodeId === designEpisodeId)
          }
          return false;
        }

        const addOrRemoveDesignEpisodeFromVariant = (variantName: string, designEpisodeId: string) => {
          let update = variantsToDesignEpisodes

          if (isDesignEpisodeSetInVariant(variantName, designEpisodeId)) {
            // @ts-ignore
            let designEpisodeIds = variantsToDesignEpisodes[variantName]
            let index = designEpisodeIds.findIndex((id: string) => id === designEpisodeId)
            designEpisodeIds.splice(index, 1)
            // @ts-ignore
            update[variantName] = designEpisodeIds
          } else {
            // @ts-ignore
            update[variantName] = [designEpisodeId]
          }
          setVariantsToDesignEpisodes((state) => {
            return {
              ...update 
            }}
          )
        }

        const addOrRemoveAllDesignEpisodeFromVariant = (variantName: string, designEpisodeIds: Array<string>) => {
          let update = variantsToDesignEpisodes
          if (Object.hasOwn(variantsToDesignEpisodes, variantName)) {
            // @ts-ignore
            delete update[variantName]
          } else {
            // @ts-ignore
            update[variantName] = designEpisodeIds
          }
          setVariantsToDesignEpisodes((state) => {
            return {
              ...update 
            }}
          )
        }

        const modalStyle = {
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #1976d2',
            boxShadow: 24,
            p: 4,
        };

        const getVariantsAndDesignEpisodes = (tree: DecisionTree): Map<string, Array<string>> => {
          let variantsAndDesignEpisodes = new Map()
          const designEpisodeIds = tree.designEpisodeIds.split(',').filter((designEpisodeId => designEpisodeId !== ''))
          variantsAndDesignEpisodes.set(tree.name, designEpisodeIds)
          tree.children
            .map((subTree: DecisionTree) => getVariantsAndDesignEpisodes(subTree))
            .forEach((value, key) => 
              Array.from(value).forEach((entry) => variantsAndDesignEpisodes.set(entry[0], entry[1]))); 
          return variantsAndDesignEpisodes;
        }

        return <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={showDesignEpisodeMatchingModal}
            onClose={() => {
                showDesignEpisodeMatchingModalHandler(false)
            }}
            closeAfterTransition
        >
            <Fade in={showDesignEpisodeMatchingModal}>
                <Box sx={modalStyle}>
                <FormGroup>    
                  {activeProjectTree && Array.from(getVariantsAndDesignEpisodes(activeProjectTree))
                  .filter((entry) => entry[1].length > 0)
                  .map((entry) => <Stack direction="row" spacing={1} alignItems="center" key={entry[0]}>
                                    <Android12Switch
                                      checked={
                                        Object.hasOwn(variantsToDesignEpisodes, entry[0]) && 
                                        /* @ts-ignore */
                                        variantsToDesignEpisodes[entry[0]].length > 0
                                      } 
                                      onChange={(event)=> addOrRemoveAllDesignEpisodeFromVariant(entry[0], entry[1])}
                                    />
                                    <Typography>{entry[0]}</Typography>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <FormGroup>
                                      {entry[1].map((designEpisodeId) => 
                                        <FormControlLabel 
                                            key={`${designEpisodeId}-designEpisode-checkbox`}
                                            label={designEpisodeId}
                                            control={
                                              <Checkbox 
                                                checked={isDesignEpisodeSetInVariant(entry[0], designEpisodeId)} 
                                                onChange={()=>addOrRemoveDesignEpisodeFromVariant(entry[0], designEpisodeId)}
                                              />
                                            }
                                        />)}
                                    </FormGroup>
                                    </div>
                                  </Stack>
                  )}
                </FormGroup>
                <div style={{display: 'flex', justifyContent: 'end'}}>
                    <Button onClick={() => {
                      showDesignEpisodeMatchingModalHandler(false)
                    }}>
                        Save
                    </Button>    
                </div>
                </Box>
            </Fade>
        </Modal>;
}