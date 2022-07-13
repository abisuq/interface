import { FunctionComponent } from "react";

type ArbitrumFlatIconProps = {
    className?: string;
};

/**
 * React Component to render OpenGraph website
 */
const ArbitrumFlatIcon: FunctionComponent<ArbitrumFlatIconProps> = ({ className }) => {
    return (
        <svg className={`fill-gray-light-12 dark:fill-white ${className || ""}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.4845 7.00454L12.1488 9.24759L15.6244 14.8105L14.9756 15.1823L11.6809 10.043L11.6807 10.0426L10.1492 12.6146L12.658 16.5115L10.3085 17.8594L10.3083 17.8595C10.1818 17.9047 10.0338 17.9021 9.90834 17.8516L7.1272 16.2689L13.0879 6.26284L10.4476 6.27238L4.47148 16.0322L6.55953 17.2222L9.0585 18.6462C9.14115 18.6927 9.21476 18.7339 9.27519 18.7675C9.36873 18.8194 9.43249 18.8541 9.45501 18.8649C9.63262 18.9503 9.88819 19 10.1185 19C10.3296 19 10.5355 18.9616 10.7303 18.8861L17.5569 14.9735C17.9487 14.6731 18.1792 14.22 18.2 13.7291V6.24928C18.1779 5.70257 17.8788 5.20209 17.4103 4.91071L10.8435 1.17334C10.38 0.942394 9.80109 0.942098 9.33681 1.17319C9.28193 1.20059 2.95076 4.83445 2.95076 4.83445C2.86314 4.87605 2.77873 4.92558 2.69935 4.98182C2.28112 5.27846 2.02619 5.73946 2 6.24591V13.9859V14.6234L3.77435 15.6353L9.6796 6.26281L8.67736 6.23663C8.32044 6.23164 7.952 6.26712 7.61319 6.35991C7.59736 6.36425 7.58159 6.36871 7.5659 6.3733C7.11391 6.50546 6.71908 6.74281 6.48164 7.12639L3.12818 12.2704L3.12818 12.27L3.12786 12.2705L3.11797 6.29829C3.11928 6.27638 3.12213 6.25472 3.12599 6.23344C3.15161 6.093 3.23081 5.9678 3.35012 5.88316C3.37902 5.86267 3.40982 5.84494 3.44033 5.83086C4.17581 5.40646 9.18836 2.53489 9.78257 2.19574C9.80058 2.18393 9.81953 2.17308 9.83964 2.16317C9.87842 2.14388 9.9199 2.12948 9.9627 2.11997C10.087 2.09225 10.2225 2.10579 10.3353 2.16073L16.8171 5.85057C16.9705 5.94723 17.0666 6.1111 17.0751 6.29025V12.5501L13.4848 7.00506L13.4845 7.00454Z" />
        </svg>
    );
};

export default ArbitrumFlatIcon;
