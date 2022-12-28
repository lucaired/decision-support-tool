import axios from 'axios';
import {Buffer} from 'buffer';
import React, { useEffect } from 'react';


export interface ImageViewerProps {
    activeVariantId: string;
}

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost'

export function ImageViewer({ activeVariantId }: ImageViewerProps) {

    const [images, setImages]= React.useState([])

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
                    }
                })
                .catch((error) => console.log(error))
            })
        })

    }, [activeVariantId])

    return (<div>{images.length > 0 ? images
        .map((image, index) => <img key={index} height="300" width="300" id="myImage" src={image} alt='Image'></img>  
        ) : <div>No visualization available</div>}
        </div>
    );
}
