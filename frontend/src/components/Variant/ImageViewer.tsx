import axios from 'axios';
import {Buffer} from 'buffer';
import React, { useEffect } from 'react';


export interface ImageViewerProps {
    activeVariantId: string;
}

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost'

export function ImageViewer({ activeVariantId }: ImageViewerProps) {

    const [image, setImageSrc]= React.useState({
        src: "",
        show: false
    })

    useEffect(() => {
        axios.request({
            url: `http://${backendUrl}:80/projects/variant/${activeVariantId}/images`,
            method: 'GET',
            responseType: 'arraybuffer'
        })
        .then(response => {
            let base64ImageString = Buffer.from(response.data, 'binary').toString('base64')
            if (base64ImageString !== "") {
                setImageSrc({src: `data:image/jpeg;base64,${base64ImageString}`, show: true})
            } else {
                setImageSrc({src: "", show: false})
            }
        })
        .catch((error) => console.log(error))
    }, [activeVariantId])

    return (
        (image.show && image.src !== "") 
        ? <img height="300" width="300" id="myImage" src={image.src} alt='Image'></img> 
        : <div>No visualization possible</div>
    );
}
