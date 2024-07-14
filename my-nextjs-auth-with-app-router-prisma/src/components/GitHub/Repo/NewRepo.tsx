'use client'

import { createNewRepo } from "@/actions/repo";
import { useState, useRef } from "react";
import { RepoSchema } from "@/lib/schema/repo";

const NewRepo = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    async function action(formData: FormData){
        const {success, message, error } = await createNewRepo(formData);
        console.log(`success: ${success}, message: ${message}, error: ${JSON.stringify(error)}` );
        if(!success){
            // get zod error if found
            if (error){
                const urlError = error?.url?._errors.join(', ') as string
                setValidationError(urlError);
            } else {
                setValidationError(message);
            }

        } else {
            setValidationError(null);
            formRef?.current?.reset();
        }
    }

    return (
        <form action={action} ref={formRef}>
            <div className="flex items-center">
                <label className="mr-4">Repo Name</label>
                <input type="text" name="repo" className="flex-1 mt-2 border border-gray-200" placeholder="https://github.com/myname/myrepo"/>
                {validationError && <p className="text-red-500">{validationError}</p> }
                <button className="ml-4 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-700 transition-colors" type="submit">Create</button>
            </div>
        </form>
    );
};

export default NewRepo;
