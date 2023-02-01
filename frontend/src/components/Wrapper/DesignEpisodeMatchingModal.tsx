import * as React from 'react';
import { Box, Button, Card, Checkbox, Divider, Fade, FormControlLabel, Modal, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { DecisionTree } from '../Tree/NodeHandler';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost:4000'

interface DesignEpisode { 
  Guid: string;
  description: string;
  name: string;
  explanation_tags: Array<string>;
}

interface DesignEpisodeMatchingModalProps {
    showDesignEpisodeMatchingModal: boolean; 
    showDesignEpisodeMatchingModalHandler: (show: boolean)=>void;
    queryMatchingProjects: (variantsToDesignEpisodes: Object) => void;
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
    queryMatchingProjects,
    activeProjectTree,
}: DesignEpisodeMatchingModalProps
    ) {
        // local state with variantName -> [DEId1, DEId2, ...]
        //@ts-ignore
        const [variantsToDesignEpisodes, setVariantsToDesignEpisodes] = React.useState<Object>({});
        
        const isDesignEpisodeSetInVariant = (variantName: string, designEpisodeId: string) => {
          if (Object.hasOwn(variantsToDesignEpisodes, variantName)) {
            // @ts-ignore
            return variantsToDesignEpisodes[variantName]['designEpisodes'].findIndex((designEpisode: object) => designEpisode.designEpisodeId === designEpisodeId) !== -1
          }
          return false;
        }

        const addOrRemoveDesignEpisodeFromVariant = (variantName: string, designEpisodeId: string) => {
          let update = {...variantsToDesignEpisodes}

          if (isDesignEpisodeSetInVariant(variantName, designEpisodeId)) {
            // @ts-ignore
            let designEpisodes = variantsToDesignEpisodes[variantName]['designEpisodes']
            // @ts-ignore
            let index = designEpisodes.findIndex((designEpisode: object) => designEpisode.designEpisodeId === designEpisodeId)
            designEpisodes.splice(index, 1)
            // @ts-ignore
            update[variantName]['designEpisodes'] = designEpisodes
          } else {
            // @ts-ignore
            if (Object.hasOwn(variantsToDesignEpisodes, variantName)) {
              // @ts-ignore
              update[variantName]['designEpisodes'] = [
              // @ts-ignore
                ...variantsToDesignEpisodes[variantName]['designEpisodes'],
                 {designEpisodeId: designEpisodeId, designEpisodeWeight: 1}
              ]
            } else {
              // @ts-ignore
              update[variantName] = {designEpisodes: [{designEpisodeId: designEpisodeId, designEpisodeWeight: 1}], variantWeight: 1}
            }
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
            update[variantName] = {
              designEpisodes: designEpisodeIds.map((designEpisodeId) => {
                return {designEpisodeId: designEpisodeId, designEpisodeWeight: 1}
              }),
              variantWeight: 1
            }
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

        const getDesignEpisodeWeight = (variantName: string, designEpisodeId: string) => {
          // @ts-ignore
          return variantsToDesignEpisodes[variantName]['designEpisodes']
          // @ts-ignore
          .filter((designEpisode: object) => designEpisode.designEpisodeId === designEpisodeId)
          // @ts-ignore
          .map((designEpisode: object) => designEpisode.designEpisodeWeight) || 1
        }

        const handleVariantWeightChange = (variantName: string, weight: string) => {
          if (Object.hasOwn(variantsToDesignEpisodes, variantName)) {
            let update = {...variantsToDesignEpisodes}
            // @ts-ignore
            update[variantName]['variantWeight'] = Math.max(weight,1)
            setVariantsToDesignEpisodes((state) => {
              return {
                ...update 
              }}
            )
          }
        };

        const handleDesignEpisodeWeightChange = (variantName: string, designEpisodeId: string, weight: string) => {
          if (Object.hasOwn(variantsToDesignEpisodes, variantName)) {
            let update = {...variantsToDesignEpisodes}
            // @ts-ignore
            let index = update[variantName]['designEpisodes'].findIndex((designEpisode: object) => designEpisode.designEpisodeId === designEpisodeId)
            if (index !== -1) {
              // @ts-ignore
              const designEpisode = update[variantName]['designEpisodes'][index]
              // @ts-ignore
              update[variantName]['designEpisodes'][index] = {...designEpisode, designEpisodeWeight:  Math.max(weight,1)}
              console.log(update)
              setVariantsToDesignEpisodes((state) => {
                return {
                  ...update 
                }}
              )
            }
          }
        };

        // retrieve Design Episodes show their pretty names
        const [allDesignEpisodes, setAllDesignEpisodes] = React.useState<DesignEpisode[]>([]);

        const queryDesignEpisodes = () => axios.get(`http://${backendUrl}/projects/design_episodes`)
        // @ts-ignore
        .then(function (response) {
          setAllDesignEpisodes(response.data)
        })

        React.useEffect(() => {queryDesignEpisodes()}, [showDesignEpisodeMatchingModal]);

        const getNameForDesignEpisodeId = (guid: string): string => {
          return allDesignEpisodes
            .filter((designEpisode) => designEpisode.Guid === guid)
            .map((designEpisode) => designEpisode.name)
            [0] || "No name"
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
                <Typography style={{fontSize: '24px', fontWeight: '600', paddingBottom: '15px'}}>Configure project matching</Typography>
                <FormGroup>    
                  {activeProjectTree && Array.from(getVariantsAndDesignEpisodes(activeProjectTree))
                  .filter((entry) => entry[1].length > 0)
                  .map((entry) => <div key={entry[0]}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Card>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Typography style={{fontWeight: '600', paddingLeft: '5px'}}>{entry[0]}</Typography>
                        <Android12Switch
                          checked={
                            Object.hasOwn(variantsToDesignEpisodes, entry[0]) && 
                            /* @ts-ignore */
                            variantsToDesignEpisodes[entry[0]]['designEpisodes'].length > 0
                          } 
                          onChange={(event)=> addOrRemoveAllDesignEpisodeFromVariant(entry[0], entry[1])}
                        />
                        </div>
                        { Object.hasOwn(variantsToDesignEpisodes, entry[0]) && 
                            /* @ts-ignore */
                            variantsToDesignEpisodes[entry[0]]['designEpisodes'].length > 0 &&                       <Box
                          component="form"
                          sx={{
                            '& .MuiTextField-root': { m: 1, width: '12ch' },
                          }}
                        autoComplete="off"
                      >
                        <TextField
                          id="outlined-number"
                          label="Weight"
                          // @ts-ignore
                          value={variantsToDesignEpisodes[entry[0]]['variantWeight']}
                          type="number"
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(event) => handleVariantWeightChange(entry[0], event.target.value)}
                        />               
                      </Box>}
                      </Card>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                        <FormGroup>
                          {entry[1].map((designEpisodeId) =>
                          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}} key={entry[0]}>
                            <FormControlLabel 
                                key={`${designEpisodeId}-designEpisode-checkbox`}
                                label={getNameForDesignEpisodeId(designEpisodeId)}
                                control={
                                  <Checkbox 
                                    checked={isDesignEpisodeSetInVariant(entry[0], designEpisodeId)} 
                                    onChange={()=>addOrRemoveDesignEpisodeFromVariant(entry[0], designEpisodeId)}
                                  />
                                }
                            />
                                                    {isDesignEpisodeSetInVariant(entry[0], designEpisodeId) && <Box
                          component="form"
                          sx={{
                            '& .MuiTextField-root': { m: 1, width: '12ch' },
                          }}
                        autoComplete="off"
                      >
                        <TextField
                          id="outlined-number"
                          label="Weight"
                          // @ts-ignore
                          value={getDesignEpisodeWeight(entry[0], designEpisodeId)}
                          type="number"
                          size="small"
                          InputLabelProps={{
                              shrink: true,
                          }}
                          onChange={(event) => handleDesignEpisodeWeightChange(entry[0], designEpisodeId, event.target.value)}
                        />               
                      </Box>}
                          </div> 
                            )}
                        </FormGroup>
                        </div>
                      </Stack>
                      <Divider/>
                    </div>
                  )}
                </FormGroup>
                <div style={{display: 'flex', justifyContent: 'end'}}>
                    <Button onClick={() => {
                      showDesignEpisodeMatchingModalHandler(false);
                      setVariantsToDesignEpisodes({});
                      queryMatchingProjects(variantsToDesignEpisodes);
                    }}>
                        Match
                    </Button>    
                </div>
                </Box>
            </Fade>
        </Modal>;
}