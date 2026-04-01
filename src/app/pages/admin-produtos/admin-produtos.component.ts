import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';

@Component({
  selector: 'app-admin-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-produtos.component.html',
  styleUrls: ['./admin-produtos.component.scss']
})
export class AdminProdutosComponent implements OnInit {
  @ViewChild('formCard') formCard?: ElementRef<HTMLElement>;
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  produtos: ProdutoItem[] = [];
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editingId: number | null = null;
  nome = '';
  preco: number | null = null;
  videoUrl = '';
  selectedImageFile: File | null = null;

  constructor(
    private readonly produtoApiService: ProdutoApiService,
    private readonly authService: AdminAuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadProdutos();
  }

  loadProdutos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.produtoApiService.getAdminProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel carregar os produtos.';
        this.loading = false;
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImageFile = input.files?.[0] || null;
  }

  startEdit(produto: ProdutoItem): void {
    if (!produto.ativo) {
      this.errorMessage = 'Reative o produto antes de editar.';
      this.successMessage = '';
      return;
    }

    this.editingId = produto.id;
    this.nome = produto.nome;
    this.preco = produto.preco;
    this.videoUrl = produto.videoUrl || '';
    this.selectedImageFile = null;
    this.errorMessage = '';
    this.successMessage = '';

    setTimeout(() => {
      this.formCard?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  submit(): void {
    if (!this.nome.trim()) {
      this.errorMessage = 'Informe o nome do produto.';
      return;
    }

    if (this.preco === null || Number.isNaN(this.preco)) {
      this.errorMessage = 'Informe o preco do produto.';
      return;
    }

    if (!this.editingId && !this.selectedImageFile) {
      this.errorMessage = 'Selecione a imagem do produto.';
      return;
    }

    const payload = new FormData();
    payload.append('nome', this.nome.trim());
    payload.append('preco', this.preco.toFixed(2));
    payload.append('videoUrl', this.videoUrl.trim());

    if (this.selectedImageFile) {
      payload.append('image', this.selectedImageFile);
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.editingId
      ? this.produtoApiService.updateProduto(this.editingId, payload)
      : this.produtoApiService.createProduto(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = this.editingId ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.';
        this.resetForm();
        this.loadProdutos();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel salvar o produto.';
      }
    });
  }

  remove(produto: ProdutoItem): void {
    const confirmed = window.confirm(`Desativar o produto "${produto.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.produtoApiService.deleteProduto(produto.id).subscribe({
      next: () => {
        this.successMessage = 'Produto desativado com sucesso.';
        if (this.editingId === produto.id) {
          this.resetForm();
        }
        this.loadProdutos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'Nao foi possivel remover o produto.';
      }
    });
  }

  reactivate(produto: ProdutoItem): void {
    const confirmed = window.confirm(`Reativar o produto "${produto.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.produtoApiService.reactivateProduto(produto.id).subscribe({
      next: () => {
        this.successMessage = 'Produto reativado com sucesso.';
        this.loadProdutos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'Nao foi possivel reativar o produto.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  private resetForm(): void {
    this.editingId = null;
    this.nome = '';
    this.preco = null;
    this.videoUrl = '';
    this.selectedImageFile = null;
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value ?? 0));
  }
}
