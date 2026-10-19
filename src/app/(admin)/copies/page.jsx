
import { getBook } from '@/lib/getdata/getBooks';
import Catagorytable from './Categorytable';


const Page = async () => {
    const books = await getBook();

    return (
        <div className="p-4 md:p-8">
            <Catagorytable books={books} />
        </div>
    );
};

export default Page;