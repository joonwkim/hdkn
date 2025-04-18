import React from 'react';
import Image from "next/image";

interface UserAvartarProps {
    url: string | null,
    name: string,
}

const UserAvartar = ({ url, name }: UserAvartarProps) => {
    if (!url) {
        return (
            <div>name</div>
        )
    } else {
        return (
            <Image
                id="userpicture"
                unoptimized
                src={url}
                alt=''
                title={name ? name : ''}
                width="30"
                height="30"
                style={{
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    objectFit: 'cover'
                }} />
        )
    }

}

export default UserAvartar