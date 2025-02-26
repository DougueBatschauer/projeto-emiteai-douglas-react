import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemPessoa {
  id: number;
  municipio: number;
  nome: string;
  cpf: string;
  telefone: string;
  rua: string;
  numero: number;
  complemento: string;
  cep: number;
  bairro: string;
  estado: string;
}

export interface IDetalhePessoa {
  id: number;
  municipio: string | null | undefined;
  nome: string;
  cpf: string;
  telefone: string | null | undefined;
  rua: string | null | undefined;
  numero: string | null | undefined;
  complemento: string | null | undefined;
  cep: string | null | undefined;
  bairro: string | null | undefined;
  estado: string | null | undefined;
}

type ICep = {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: number;
  ibge: number;
  gia: string;
  ddd: string;
  siafi: string;
}

type TPessoasComTotalCount = {
  data: IListagemPessoa[];
  totalCount: number;
}

const getAllAssync = () : Promise<any | Error> => {
  const urlRelativa = '/api/pessoa-fisica';

  return Api.get(urlRelativa);
};

const getAllWithPaging = async (page = 1): Promise<TPessoasComTotalCount | Error> => {
  try {
    const urlRelativa = `/api/pessoa-fisica?page=${page - 1}&size=${Environment.LIMITE_DE_LINHAS}`;

    const { data } = await Api.get(urlRelativa);

    if (data) {
      return {
        data : data.content,
        totalCount: Number(data.totalElements || Environment.LIMITE_DE_LINHAS),
      };
    }

    return new Error('Erro ao listar os registros.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
  }
};

const getByNome = async (page = 1, nome = ''): Promise<TPessoasComTotalCount | Error> => {
  try {
    const urlRelativa = `/api/pessoa-fisica/filter/${nome}?page=${page - 1}&size=${Environment.LIMITE_DE_LINHAS}`;

    const { data } = await Api.get(urlRelativa);

    if (data) {
      return {
        data : data.content,
        totalCount: Number(data.totalElements || Environment.LIMITE_DE_LINHAS),
      };
    }

    return new Error('Erro ao listar os registros.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
  }
};

const getById = async (id: number): Promise<IDetalhePessoa | Error> => {
  try {
    const { data } = await Api.get(`/api/pessoa-fisica/${id}`);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalhePessoa, 'id'>): Promise<number | Error> => {
  try {
    const { data } = await Api.post<IDetalhePessoa>('/api/pessoa-fisica', dados);

    if (data) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const update = async (dados: IDetalhePessoa): Promise<void | Error> => {
  try {
    await Api.put(`/api/pessoa-fisica`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/api/pessoa-fisica/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};

const validCpf = async (cpf: string): Promise<boolean | Error> => {
  try {
    const { data } = await Api.get(`/api/pessoa-fisica/valid-cpf/${cpf}`);
    return data;
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao validar o CPF.');
  }
};

const getInfosCep = async (cep: string): Promise<ICep> => {
  try {
    const { data } = await Api.get(`https://cors-anywhere.herokuapp.com/https://viacep.com.br/ws/${cep}/json/`, {
      headers: {
        'origin': 'http://localhost:3000'
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    return {} as ICep;
  }
};

export const PessoasService = {
  getAllWithPaging,
  create,
  getById,
  update,
  deleteById,
  validCpf,
  getInfosCep,
  getAllAssync,
  getByNome
};
