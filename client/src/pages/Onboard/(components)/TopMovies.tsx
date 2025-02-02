import React, { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

import { useSearchMovies } from "../../../services/movieService"
import { RxCrossCircled } from "react-icons/rx"
import { toast } from "react-toastify" // Only import toast, not ToastContainer
import { Movie } from "../../../Types/Movie"
import { movieSchema } from "../../../Types/Movie"
import "../../../index.css"

// Define topMoviesSchema using movieSchema
export const topMoviesSchema = z.object({
    topMovies: z.array(movieSchema).max(5),
})
type TopMoviesData = z.infer<typeof topMoviesSchema>

interface Props {
    onNext: () => void
    onPrevious: () => void
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const TopMovies: React.FC<Props> = ({ onNext, onPrevious, handleKeyDown }) => {
    const {
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<TopMoviesData>()
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<Movie[]>([])

    const { data: movies, isLoading, refetch } = useSearchMovies(searchTerm)

    useEffect(() => {
        if (searchTerm.length > 2) {
            refetch()
        } else {
            setSearchResults([])
        }
    }, [searchTerm, refetch])

    useEffect(() => {
        if (movies) {
            setSearchResults(movies.slice(0, 10))
        }
    }, [movies])

    const topMovies = watch("topMovies") || []

    const handleAddMovie = (movie: Movie) => {
        const isDuplicate = topMovies.some((m) => m.id === movie.id)
        if (isDuplicate) {
            toast.warn("This movie is already in your top list.")
        } else if (topMovies.length < 5) {
            setValue("topMovies", [...topMovies, movie])
            toast.success("Movie added to your top list!")
        } else {
            toast.error("You can only select up to 5 movies")
        }
        setSearchTerm("")
        setSearchResults([])
        console.log(topMovies)
    }

    const handleRemoveMovie = (movieId: string) => {
        setValue(
            "topMovies",
            topMovies.filter((movie) => movie.id !== movieId)
        )
        toast.info("Movie removed from your top list.")
    }

    return (
        <div className="w-full h-full lg:grid lg:grid-cols-5 lg:min-h-screen ">
            <div className="w-full h-full flex flex-col items-center py-24 col-span-2 justify-start lg:justify-center shadow-2xl bg-main">
                <h2 className="text-3xl font-bold mb-12 px-4 text-center">
                    Select Your Top 5 Movies
                </h2>
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search movies"
                        value={searchTerm}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-[320px] sm:w-[400px] bg-transparent text-white"
                    />
                    {isLoading && <p>Loading...</p>}
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full overflow-y-auto h-[300px] lg:h-28 mt-1 bg-white text-gray-800 rounded-lg shadow-lg ">
                            {searchResults.map((movie) => (
                                <li
                                    key={movie.id}
                                    className="flex items-center space-x-4 p-3 hover:bg-gray-100 cursor-pointer border-b-2"
                                    onClick={() => handleAddMovie(movie)}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex flex-col">
                                        <span className="flex-grow text-sm">
                                            {movie.title}
                                        </span>
                                        <span className="text-xs">
                                            {movie.release_date?.slice(0, 4)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {topMovies.length > 0 && (
                    <div className="mb-6 w-[320px] sm:w-[400px]">
                        <h3 className="text-xl font-semibold mb-3">
                            Selected Movies :
                        </h3>
                        <ul className="space-y-4 h-[180px] overflow-y-auto">
                            {topMovies.map((movie) => (
                                <li
                                    key={movie.id}
                                    className="flex items-center space-x-4 bg-white bg-opacity-10 p-1 w-[320px] sm:w-[400px] border border-primary border-1 rounded-lg hover:bg-primary hover:text-white transition-colors"
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-18 h-20 object-cover rounded"
                                    />

                                    <span className="flex-grow text-sm">
                                        {movie.title}
                                    </span>

                                    <button
                                        type="button"
                                        className=""
                                        onClick={() =>
                                            handleRemoveMovie(movie.id!)
                                        }
                                    >
                                        <RxCrossCircled size="24px" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {errors.topMovies && (
                    <span className="text-red-300 block mb-4">
                        {errors.topMovies.message}
                    </span>
                )}
                <div className="mt-10 self-end lg:self-auto flex w-full justify-evenly">
                    <button
                        type="button"
                        className="btn btn-secondary text-white"
                        onClick={onPrevious}
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline hover:bg-primary hover:text-white"
                        onClick={onNext}
                    >
                        Next
                    </button>
                </div>
            </div>
            <div className="hidden lg:flex lg:items-center lg:justify-center  lg:col-span-3 bg-[#FEFEFA]">
                <div className="w-full h-full flex items-center justify-center">
                    <img
                        src="/profile_page.svg"
                        alt="Sign Up Illustration"
                        className="w-[400px] h-auto"
                    />
                </div>
            </div>
        </div>
    )
}

export default TopMovies
