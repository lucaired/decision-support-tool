import { Box, Button, ImageList, ImageListItem, ImageListItemBar, Modal } from '@mui/material';
import axios from 'axios';
import {Buffer} from 'buffer';
import React, { useEffect } from 'react';
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';


export interface ImageViewerProps {
    activeVariantId: string;
}

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost'

export function ImageViewer({ activeVariantId }: ImageViewerProps) {

    const [images, setImages]= React.useState([])
    const [imageNames, setImageNames]= React.useState([])

    useEffect(() => {
        setImages([])
        axios.request({
            url: `http://${backendUrl}:80/projects/variant/${activeVariantId}/images`,
            method: 'GET',
        })
        .then((response)=> {
            // @ts-ignore
            response.data.forEach((imageName) => {
                axios.request({
                    url: `http://${backendUrl}:80/projects/variant/image/${imageName}`,
                    method: 'GET',
                    responseType: 'arraybuffer'
                })
                .then(response => {
                    let base64ImageString = Buffer.from(response.data, 'binary').toString('base64')
                    if (base64ImageString !== "") {
                        // @ts-ignore
                        setImages((images) => {
                            // TODO: make this more performant
                            return Array.from(new Set([...images, `data:image/jpeg;base64,${base64ImageString}`]))
                        })
                        // @ts-ignore
                        setImageNames((imageNames) => {
                            // TODO: make this more performant
                            return Array.from(new Set([...imageNames, imageName]))
                        })
                    }
                })
                .catch((error) => console.log(error))
            })
        })

    }, [activeVariantId])

    // full size image modal
    const [open, setOpen] = React.useState(false);
    const [currentOpenImageIndex, setCurrentOpenImageIndex] = React.useState(-1);
    const handleClose = () => {
        setOpen(false);
        setCurrentOpenImageIndex(-1)
    }
    const handleOpen = (index: number) => {
        setCurrentOpenImageIndex(index)
        setOpen(true);
    }
    const style = {
        position: 'absolute' as 'absolute',
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper'
    };

    return (
        <div>{images.length > 0 ? 
            <div>
                <ImageList>
                    {images.map((image, index) => (
                        <ImageListItem 
                            key={index}
                            onClick={() => handleOpen(index)}
                        >
                            <img id="myImage" src={image} alt='Image'></img>  
                            <ImageListItemBar
                                title={imageNames[index]}
                                position={'below'}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <Button
                                style={{justifyContent: 'end'}}
                                onClick={() => handleClose()}
                                startIcon={<CloseFullscreenIcon/>}
                            />
                            <ImageListItem 
                                key={currentOpenImageIndex}
                            >
                                <img id="myImage" src={images[currentOpenImageIndex]} alt='Image'></img>  
                                <ImageListItemBar
                                    title={imageNames[currentOpenImageIndex]}
                                    position={'top'}
                                />
                            </ImageListItem>
                        </div>
                    </Box>
                </Modal>
            </div>
            : <div>No visualization available</div>}
        </div>
    );
}
