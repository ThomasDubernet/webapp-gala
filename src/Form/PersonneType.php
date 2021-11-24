<?php

namespace App\Form;

use App\Entity\CategoriePersonne;
use App\Entity\Personne;
use App\Entity\Table;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PersonneType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'label' => 'Nom'
            ])
            ->add('prenom', TextType::class, [
                'label' => 'Prénom'
            ])
            ->add('adresse', TextType::class, [
                'label' => 'Adresse postale'
            ])
            ->add('telephone', TextType::class, [
                'label' => 'Numéro de téléphone'
            ])
            ->add('email', TextType::class, [
                'label' => 'Email'
            ])
            ->add('montantBillet', NumberType::class, [
                'label' => 'Montant du billet',
                'required' => false
            ])
            ->add('montantPaye', NumberType::class, [
                'label' => 'Montant déjà payé',
                'required' => false
            ])
            ->add('dateReglement', DateType::class, [
                'label' => 'Date du paiement',
                'required' => false
            ])
            ->add('moyenPaiement', NumberType::class, [
                'label' => 'Moyen de paiement',
                'required' => false
            ])
            ->add('commentaire', TextareaType::class, [
                'label' => 'Zone de commentaire',
                'required' => false
            ])
            ->add('categorie', EntityType::class, [
                'class' => CategoriePersonne::class,
                'choice_label' => 'nom',
                'placeholder' => 'Choisir une catégorie',
                'label' => 'Catégorie',
                'required' => false
            ])
            ->add('table', EntityType::class, [
                'class' => Table::class,
                'choice_label' => function (Table $table) {
                    return "N°" . $table->getNumero() . " | " . $table->getNom();
                },
                'placeholder' => 'Choisir une table',
                'label' => 'Table associée',
                'required' => false
            ])
            // ->add('conjoint')
            ->add('creation', SubmitType::class, [
                'label' => 'Créer',
                'attr' => [
                    'class' => 'btn btn-primary'
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Personne::class,
        ]);
    }
}
