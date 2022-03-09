import { getApi } from "../../utils/blockchain"

export const queryChain = async (storage: string, getter: string) => {
    const api = await getApi()
    return await api.query[storage][getter]();
}