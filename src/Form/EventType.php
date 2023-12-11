<?php

namespace App\Form;

use App\Entity\Evenement;
use App\Entity\MediaObject;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class EventType extends AbstractType
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'label' => 'Nom de l\'évènement'
            ])
            ->add('nomSalle', TextType::class, [
                'label' => 'Nom de la salle',
            ])
            ->add('date', DateTimeType::class, [
                'label' => 'Date de l\'évènement',
                'data' => new \DateTime('now'),
            ])
            ->add('adresse', TextType::class, [
                'label' => 'Adresse de l\'évènement ',
            ])
            ->add('codePostal', TextType::class, [
                'label' => 'Code postal',
            ])
            ->add('ville', TextType::class, [
                'label' => 'Ville',
            ])
            ->add('textEmail', TextareaType::class, [
                'label' => 'Texte de l\'email',
            ])
            ->add('planFile', FileType::class, [
                'label' => 'Plan de la salle',
                'mapped' => false,
                'required' => false
            ])
            ->add('imageTicketFile', FileType::class, [
                'label' => 'Image de fond du ticket',
                'mapped' => false,
                'required' => false
            ])
            ->add('billetwebId', TextType::class, [
                'label' => 'ID de l\'évènement sur Billetweb',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Evenement::class,
        ]);
    }
}
