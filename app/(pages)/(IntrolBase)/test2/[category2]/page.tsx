export default function Page({ params }: { params: { category2: string; pageName: string } }) {

    return (
        <div>
            <h1>{`pageName in slug category2: ${params.category2}`}</h1>
            <p>{`Page: ${params.pageName}`}</p>

        </div>
    );
}