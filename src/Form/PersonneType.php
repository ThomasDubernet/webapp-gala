<?php

namespace App\Form;

use App\Entity\CategoriePersonne;
use App\Entity\Personne;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
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
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $tableToAdd = isset($options['attr']['table'])
            ? $this->em->getRepository(Table::class)->find($options['attr']['table'])
            : null;
        $tableAttributes = $options['data']->getTable() !== null
            ? $options['data']->getTable()
            : null;
        $catPers = $options['data']->getCategorie() !== null
            ? $options['data']->getCategorie()
            : null;

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
                'required' => false,
                'data' => $catPers ? $catPers : null
            ])
            ->add('table', EntityType::class, [
                'class' => Table::class,
                'choice_label' => function (Table $table) {
                    if (count($table->getPersonnes()) < $table->getNombrePlacesMax()) {
                        return "N°" . $table->getNumero() . " | " . $table->getNom();
                    }
                },
                'placeholder' => 'Choisir une table',
                'label' => 'Table associée',
                'required' => false,
                'data' => $tableToAdd != null ? $tableToAdd : $tableAttributes
            ])
            // ->add('conjoint')
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Personne::class,
        ]);
    }
}
