<?php

namespace App\Form;

use App\Entity\Evenement;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class EventType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'label' => 'Nom de l\'évènement'
            ])
            ->add('nomSalle', TextType::class, [
                'label' => 'Nom de la salle'
            ])
            ->add('date', DateTimeType::class, [
                'label' => 'Date de l\'évènement'
            ])
            ->add('adresse', TextType::class, [
                'label' => 'Adresse de l\'évènement '
            ])
            // ->add('plan', FileType::class, [
            //     'label' => 'Plan de la salle'
            // ])
            // ->add('imageTicket', FileType::class, [
            //     'label' => 'Image de fond du ticket'
            // ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Evenement::class,
        ]);
    }
}
