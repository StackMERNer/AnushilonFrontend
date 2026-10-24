import Image from 'next/image'

const Logo = ({ height = 50, width = 50 }) => {
    return (
        <Image src={'/logo.svg'} alt='Proshnokosh প্রশ্নকোষ logo' className='mb-3' height={height} width={width} />
    )
}

export default Logo