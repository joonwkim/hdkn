export default function Page({ params }: { params: { category: string; pageName: string } }) {
    
    return (
        <div>
            <h1>{`path: ${params.category}`}</h1>
            <p>{`Page: ${params.pageName}`}</p>
         
        </div>
    );
}