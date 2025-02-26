import { useEffect, useState } from 'react';
import { Box, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { PessoasService } from '../../shared/services/api/pessoas/PessoasService';
import { VTextField, VForm, useVForm, IVFormErrors } from '../../shared/forms';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';

interface IFormData {
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

export interface ICep {
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

export const DetalheDePessoas: React.FC = () => {
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const { id = 'nova' } = useParams<'id'>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [error] = useState('');
  const [valid] = useState(true);

  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true);

      PessoasService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            alert(result.message);
            navigate('/pessoas');
          } else {
            setNome(result.nome);
            setCpf(result.cpf);
            formRef.current?.setData(result);
          }
        });
    } else {
      formRef.current?.setData({
        cpf: '',
        municipio: '',
        nome: '',
        telefone: '',
        rua: '',
        numero: '',
        complemento: '',
        cep: '',
        bairro: '',
        estado: '',
      });
    }
  }, [id]);

  const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
    cpf: yup.string()
    .required('CPF é obrigatório')
    .transform((originalValue) => {
      return originalValue.replace(/\D/g, '');
    })
    .length(11, 'CPF deve ter 11 dígitos')
    .test('cpf-exists', 'Este CPF já está em uso', async value => {
      if (!value) {
        return true;
      }
  
      if (value === cpf) {
        return true;
      }
  
      const exists = await PessoasService.validCpf(value);
      return !exists;
    }),
    nome: yup.string().required(),
    municipio: yup.string().notRequired().nullable(),
    telefone: yup.string().notRequired().nullable(),
    rua: yup.string().notRequired().nullable(),
    numero: yup.string().notRequired().nullable(),
    complemento: yup.string().notRequired().nullable(),
    cep: yup.string().notRequired().nullable(),
    bairro: yup.string().notRequired().nullable(),
    estado: yup.string().notRequired().nullable()
  });

  const handleSave = (dados: IFormData) => {
    formValidationSchema
      .validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);
        setCpf(dadosValidados.cpf);

        if (id === 'nova') {
          PessoasService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/pessoas');
                } else {
                  navigate(`/pessoas/detalhe/${result}`);
                }
              }
            });
        } else {
          PessoasService
            .update({id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/pessoas');
                }
              }
            });
        }
      })
      .catch((errors: yup.ValidationError) => {
        const validationErrors: IVFormErrors = {};

        errors.inner.forEach(error => {
          if (!error.path) return;

          validationErrors[error.path] = error.message;
        });

        formRef.current?.setErrors(validationErrors);
      });
  };

  const setInfosAccordingCep = (cep: string) => {
    PessoasService.getInfosCep(cep).then(ceps => {
      formRef?.current?.setFieldValue('municipio', ceps.localidade || '');
      formRef?.current?.setFieldValue('rua', ceps.logradouro || '');
      formRef?.current?.setFieldValue('complemento', ceps.complemento || '');
      formRef?.current?.setFieldValue('bairro', ceps.bairro || '');
      formRef?.current?.setFieldValue('estado', ceps.estado || '');
    });

  };

  const handleDelete = (id: number) => {
    if (window.confirm('Realmente deseja apagar?')) {
      PessoasService.deleteById(id)
        .then(result => {
          if (result instanceof Error) {
            alert(result.message);
          } else {
            alert('Registro apagado com sucesso!');
            navigate('/pessoas');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Nova pessoa' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={id !== 'nova'}

          aoClicarEmSalvar={save}
          aoClicarEmSalvarEFechar={saveAndClose}
          aoClicarEmVoltar={() => navigate('/pessoas')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/pessoas/detalhe/nova')}
        />
      }
    >
      <VForm ref={formRef} onSubmit={handleSave}>
        <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">

          <Grid container direction="column" padding={2} spacing={2}>

            {isLoading && (
              <Grid item>
                <LinearProgress variant='indeterminate' />
              </Grid>
            )}

            <Grid item>
              <Typography variant='h6'>Geral</Typography>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  name='nome'
                  disabled={isLoading}
                  label='Nome completo'
                  onChange={e => setNome(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  name='cpf'
                  label='CPF'
                  value={cpf}
                  error={!valid}
                  helperText={error}
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Telefone'
                  name='telefone'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Cep'
                  name='cep'
                  disabled={isLoading}
                  onBlur={e => setInfosAccordingCep(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Rua'
                  name='rua'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Numero'
                  name='numero'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Complemento'
                  name='complemento'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Bairro'
                  name='bairro'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Municipio'
                  name='municipio'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                <VTextField
                  fullWidth
                  label='Estado'
                  name='estado'
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
          </Grid>

        </Box>
      </VForm>
    </LayoutBaseDePagina>
  );
};
