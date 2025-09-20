import Shell from "../../../components/Shell";
export default function Page({ params }: { params: { slug: string }}) {
    return <Shell>Public booking for {params.slug}</Shell>;
}
