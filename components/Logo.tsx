import Image from 'next/image'

const Logo = ({ height = 50, width = 50 }) => {
    return (
        <Image src={'/app-logo2.png'} alt='Proshnokosh অনুশীলন logo' className='mb-3' height={height} width={width} />
    )
}

export default Logo