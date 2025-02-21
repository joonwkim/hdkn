import Image from 'next/image'
import classNames from 'classnames';
export default function Page() {
  return (
    <div className={classNames('img-container', 'w - 25')}>
      <Image
        src='https://res.cloudinary.com/dhhev1lrj/image/upload/v1739846411/hdkn/image_ronmo3.webp'
        alt='test'
        width='1000'
        height='400'
        layout="intrinsic"
        priority
      />
    </div>
  );
}